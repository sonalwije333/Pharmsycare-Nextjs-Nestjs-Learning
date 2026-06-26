import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProcurementRecord,
  ProcurementStatus,
} from './entities/procurement-record.entity';
import { CreateProcurementRecordDto } from './dto/create-procurement-record.dto';
import { GetProcurementHistoryDto } from './dto/get-procurement-history.dto';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductsService } from '../products/products.service';
import { paginate } from '../common/pagination/paginate';

export interface ProcurementStats {
  total_orders: number;
  ordered: number;
  received: number;
  cancelled: number;
  total_quantity: number;
  total_spend: number;
}

@Injectable()
export class ProcurementHistoryService {
  constructor(
    @InjectRepository(ProcurementRecord)
    private procurementRepository: Repository<ProcurementRecord>,
    private suppliersService: SuppliersService,
    private productsService: ProductsService,
  ) {}

  async create(dto: CreateProcurementRecordDto): Promise<ProcurementRecord> {
    const supplier = await this.suppliersService.findOne(dto.supplier_id);
    const supplierName =
      supplier?.company_name || supplier?.user?.name || `Supplier #${dto.supplier_id}`;

    const product = this.productsService.getProductById(dto.product_id);
    const productName = product?.name || `Product #${dto.product_id}`;
    const sku = product?.sku ?? null;
    const unitCost =
      dto.unit_cost ?? (product ? Number(product.sale_price ?? product.price ?? 0) : null);
    const totalCost =
      unitCost != null ? Number((unitCost * dto.quantity).toFixed(2)) : null;
    const status = dto.status ?? ProcurementStatus.ORDERED;

    return this.procurementRepository.save(
      this.procurementRepository.create({
        reorder_request_id: dto.reorder_request_id ?? null,
        supplier_id: dto.supplier_id,
        supplier_name: supplierName,
        product_id: dto.product_id,
        product_name: productName,
        sku,
        quantity: dto.quantity,
        unit_cost: unitCost,
        total_cost: totalCost,
        status,
        notes: dto.notes ?? null,
        ordered_at: new Date(),
        received_at:
          status === ProcurementStatus.RECEIVED ? new Date() : null,
      }),
    );
  }

  /**
   * Records a procurement entry from a fulfilled reorder request.
   * Pricing is best-effort from the product catalogue.
   */
  async recordFromReorder(reorder: {
    id: number;
    supplier_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    requested_quantity: number;
  }): Promise<ProcurementRecord | null> {
    const existing = await this.procurementRepository.findOne({
      where: { reorder_request_id: reorder.id },
    });
    if (existing) {
      return existing;
    }

    let supplierName = `Supplier #${reorder.supplier_id}`;
    try {
      const supplier = await this.suppliersService.findOne(reorder.supplier_id);
      supplierName =
        supplier?.company_name || supplier?.user?.name || supplierName;
    } catch {
      // supplier might be missing; keep fallback name
    }

    const product = this.productsService.getProductById(reorder.product_id);
    const unitCost = product
      ? Number(product.sale_price ?? product.price ?? 0)
      : null;
    const totalCost =
      unitCost != null
        ? Number((unitCost * reorder.requested_quantity).toFixed(2))
        : null;

    return this.procurementRepository.save(
      this.procurementRepository.create({
        reorder_request_id: reorder.id,
        supplier_id: reorder.supplier_id,
        supplier_name: supplierName,
        product_id: reorder.product_id,
        product_name: reorder.product_name,
        sku: reorder.sku ?? product?.sku ?? null,
        quantity: reorder.requested_quantity,
        unit_cost: unitCost,
        total_cost: totalCost,
        status: ProcurementStatus.RECEIVED,
        ordered_at: new Date(),
        received_at: new Date(),
      }),
    );
  }

  async findAll(
    query: GetProcurementHistoryDto,
  ): Promise<{
    data: ProcurementRecord[];
    total: number;
    current_page: number;
    count: number;
    last_page: number;
    per_page: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    firstItem: number;
    lastItem: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.procurementRepository
      .createQueryBuilder('procurement')
      .leftJoinAndSelect('procurement.supplier', 'supplier')
      .orderBy('procurement.ordered_at', 'DESC')
      .addOrderBy('procurement.id', 'DESC');

    if (query.status) {
      qb.andWhere('procurement.status = :status', { status: query.status });
    }
    if (query.supplier_id) {
      qb.andWhere('procurement.supplier_id = :supplier_id', {
        supplier_id: query.supplier_id,
      });
    }
    if (query.product_id) {
      qb.andWhere('procurement.product_id = :product_id', {
        product_id: query.product_id,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(procurement.product_name LIKE :search OR procurement.supplier_name LIKE :search OR procurement.sku LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/procurement-history?limit=${limit}`;
    return {
      data,
      ...paginate(total, page, limit, data.length, url),
    };
  }

  async getStats(): Promise<ProcurementStats> {
    const records = await this.procurementRepository.find();
    const stats: ProcurementStats = {
      total_orders: records.length,
      ordered: 0,
      received: 0,
      cancelled: 0,
      total_quantity: 0,
      total_spend: 0,
    };

    for (const record of records) {
      if (record.status === ProcurementStatus.ORDERED) stats.ordered += 1;
      if (record.status === ProcurementStatus.RECEIVED) stats.received += 1;
      if (record.status === ProcurementStatus.CANCELLED) stats.cancelled += 1;
      if (record.status !== ProcurementStatus.CANCELLED) {
        stats.total_quantity += Number(record.quantity || 0);
        stats.total_spend += Number(record.total_cost || 0);
      }
    }

    stats.total_spend = Number(stats.total_spend.toFixed(2));
    return stats;
  }

  async markReceived(id: number): Promise<ProcurementRecord> {
    const record = await this.procurementRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Procurement record ${id} not found`);
    }
    record.status = ProcurementStatus.RECEIVED;
    record.received_at = new Date();
    return this.procurementRepository.save(record);
  }
}
