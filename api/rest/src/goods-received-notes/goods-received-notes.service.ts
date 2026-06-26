import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GoodsReceivedNote,
  GrnStatus,
} from './entities/goods-received-note.entity';
import { GrnItem } from './entities/goods-received-note-item.entity';
import { CreateGrnDto } from './dto/create-grn.dto';
import { GetGrnsDto } from './dto/get-grns.dto';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductsService } from '../products/products.service';
import { ProcurementHistoryService } from '../procurement-history/procurement-history.service';
import { ProcurementStatus } from '../procurement-history/entities/procurement-record.entity';
import { paginate } from '../common/pagination/paginate';

export interface GrnStats {
  total_notes: number;
  draft: number;
  received: number;
  cancelled: number;
  total_quantity: number;
  total_cost: number;
}

@Injectable()
export class GoodsReceivedNotesService {
  constructor(
    @InjectRepository(GoodsReceivedNote)
    private grnRepository: Repository<GoodsReceivedNote>,
    private suppliersService: SuppliersService,
    private productsService: ProductsService,
    private procurementService: ProcurementHistoryService,
  ) {}

  private round(value: number): number {
    return Number((value || 0).toFixed(2));
  }

  private async generateGrnNumber(): Promise<string> {
    const count = await this.grnRepository.count();
    const seq = String(count + 1).padStart(5, '0');
    const year = new Date().getFullYear();
    return `GRN-${year}-${seq}`;
  }

  async create(
    dto: CreateGrnDto,
    userId?: number,
  ): Promise<GoodsReceivedNote> {
    const supplier = await this.suppliersService.findOne(dto.supplier_id);
    const supplierName =
      supplier?.company_name ||
      supplier?.user?.name ||
      `Supplier #${dto.supplier_id}`;

    let totalQuantity = 0;
    let totalCost = 0;

    const items = dto.items.map((line) => {
      const product = this.productsService.getProductById(line.product_id);
      const productName = product?.name || `Product #${line.product_id}`;
      const sku = product?.sku ?? null;
      const unitCost =
        line.unit_cost ??
        (product ? Number(product.sale_price ?? product.price ?? 0) : null);
      const received = Number(line.received_quantity || 0);
      const ordered = Number(line.ordered_quantity ?? received);
      const lineTotal =
        unitCost != null ? this.round(unitCost * received) : null;

      totalQuantity += received;
      totalCost += lineTotal ?? 0;

      return {
        product_id: line.product_id,
        product_name: productName,
        sku,
        ordered_quantity: ordered,
        received_quantity: received,
        unit_cost: unitCost,
        total_cost: lineTotal,
      } as GrnItem;
    });

    const status = dto.status ?? GrnStatus.DRAFT;
    const grnNumber = await this.generateGrnNumber();

    const grn = this.grnRepository.create({
      grn_number: grnNumber,
      supplier_id: dto.supplier_id,
      supplier_name: supplierName,
      reorder_request_id: dto.reorder_request_id ?? null,
      invoice_number: dto.invoice_number ?? null,
      status,
      notes: dto.notes ?? null,
      received_by: status === GrnStatus.RECEIVED ? userId ?? null : null,
      received_at: status === GrnStatus.RECEIVED ? new Date() : null,
      total_quantity: totalQuantity,
      total_cost: this.round(totalCost),
      items,
    });

    const saved = await this.grnRepository.save(grn);

    if (status === GrnStatus.RECEIVED) {
      await this.postReceipt(saved);
    }

    return this.findOne(saved.id);
  }

  async findAll(query: GetGrnsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.grnRepository
      .createQueryBuilder('grn')
      .leftJoinAndSelect('grn.items', 'items')
      .orderBy('grn.created_at', 'DESC')
      .addOrderBy('grn.id', 'DESC');

    if (query.status) {
      qb.andWhere('grn.status = :status', { status: query.status });
    }
    if (query.supplier_id) {
      qb.andWhere('grn.supplier_id = :supplier_id', {
        supplier_id: query.supplier_id,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(grn.grn_number LIKE :search OR grn.supplier_name LIKE :search OR grn.invoice_number LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/goods-received-notes?limit=${limit}`;
    return {
      data,
      ...paginate(total, page, limit, data.length, url),
    };
  }

  async findOne(id: number): Promise<GoodsReceivedNote> {
    const grn = await this.grnRepository.findOne({
      where: { id },
      relations: ['items', 'supplier'],
    });
    if (!grn) {
      throw new NotFoundException(`Goods received note ${id} not found`);
    }
    return grn;
  }

  async getStats(): Promise<GrnStats> {
    const notes = await this.grnRepository.find();
    const stats: GrnStats = {
      total_notes: notes.length,
      draft: 0,
      received: 0,
      cancelled: 0,
      total_quantity: 0,
      total_cost: 0,
    };

    for (const note of notes) {
      if (note.status === GrnStatus.DRAFT) stats.draft += 1;
      if (note.status === GrnStatus.RECEIVED) stats.received += 1;
      if (note.status === GrnStatus.CANCELLED) stats.cancelled += 1;
      if (note.status === GrnStatus.RECEIVED) {
        stats.total_quantity += Number(note.total_quantity || 0);
        stats.total_cost += Number(note.total_cost || 0);
      }
    }

    stats.total_cost = this.round(stats.total_cost);
    return stats;
  }

  async receive(id: number, userId?: number): Promise<GoodsReceivedNote> {
    const grn = await this.findOne(id);
    if (grn.status === GrnStatus.RECEIVED) {
      throw new BadRequestException('This GRN has already been received');
    }
    if (grn.status === GrnStatus.CANCELLED) {
      throw new BadRequestException('Cannot receive a cancelled GRN');
    }

    grn.status = GrnStatus.RECEIVED;
    grn.received_at = new Date();
    grn.received_by = userId ?? null;
    const saved = await this.grnRepository.save(grn);

    await this.postReceipt(saved);
    return this.findOne(saved.id);
  }

  async cancel(id: number): Promise<GoodsReceivedNote> {
    const grn = await this.findOne(id);
    if (grn.status === GrnStatus.RECEIVED) {
      throw new BadRequestException(
        'Received GRNs cannot be cancelled (stock already updated)',
      );
    }
    grn.status = GrnStatus.CANCELLED;
    await this.grnRepository.save(grn);
    return this.findOne(grn.id);
  }

  /**
   * Posts a received GRN: increments product stock and writes a
   * procurement-history entry for each received line item.
   */
  private async postReceipt(grn: GoodsReceivedNote): Promise<void> {
    const items = grn.items ?? [];
    for (const item of items) {
      const received = Number(item.received_quantity || 0);
      if (received <= 0) {
        continue;
      }

      // Increment in-memory product stock.
      try {
        const product = this.productsService.getProductById(item.product_id);
        if (product) {
          const currentQty = Number((product as any).quantity || 0);
          this.productsService.update(Number(product.id), {
            quantity: currentQty + received,
            in_stock: 1,
          } as any);
        }
      } catch {
        // keep posting other items even if one product is missing
      }

      // Mirror into procurement history as a received entry.
      try {
        await this.procurementService.create({
          supplier_id: grn.supplier_id,
          product_id: item.product_id,
          quantity: received,
          unit_cost: item.unit_cost ?? undefined,
          status: ProcurementStatus.RECEIVED,
          notes: `Received via ${grn.grn_number}`,
        });
      } catch {
        // procurement mirroring is best-effort
      }
    }
  }
}
