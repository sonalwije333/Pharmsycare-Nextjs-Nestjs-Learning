import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { AssignProductSupplierDto } from './dto/assign-product-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { ProductSupplier } from './entities/product-supplier.entity';
import { User } from '../users/entities/user.entity';
import { Permission } from '../common/enums/enums';
import { GetUsersDto, UserPaginator } from '../users/dto/get-users.dto';
import { paginate } from '../common/pagination/paginate';
import { ProductsService } from '../products/products.service';
import {
  ReorderRequest,
  ReorderRequestStatus,
} from '../reorder-requests/entities/reorder-request.entity';
import {
  ProcurementRecord,
  ProcurementStatus,
} from '../procurement-history/entities/procurement-record.entity';

export interface SupplierPerformance {
  supplier_id: number;
  company_name: string;
  contact_email: string;
  is_active: boolean;
  total_requests: number;
  fulfilled: number;
  cancelled: number;
  open: number;
  fulfillment_rate: number;
  avg_lead_time_hours: number | null;
  total_procured_quantity: number;
  total_spend: number;
  last_order_at: Date | null;
  rating: number;
}

@Injectable()
export class SuppliersService implements OnModuleInit {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @InjectRepository(ProductSupplier)
    private productSuppliersRepository: Repository<ProductSupplier>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ReorderRequest)
    private reorderRepository: Repository<ReorderRequest>,
    @InjectRepository(ProcurementRecord)
    private procurementRepository: Repository<ProcurementRecord>,
    private productsService: ProductsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.suppliersRepository.count();
    if (count > 0) {
      return;
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: 'supplier@pharmsy.local' },
    });

    if (!existingUser) {
      const supplier = await this.create({
        name: 'Default Pharma Supplier',
        email: 'supplier@pharmsy.local',
        password: 'demodemo',
        company_name: 'PharmSy Wholesale Ltd',
        contact_email: 'orders@pharmsy.local',
        contact_phone: '+94770000000',
        notes: 'Default supplier for automated low-stock reorders',
      });

      const lowStock = this.productsService.getProductsStock({ page: 1, limit: 100 });
      for (const product of lowStock.data.slice(0, 20)) {
        await this.assignProduct(supplier.id, {
          product_id: Number(product.id),
          reorder_quantity: 50,
        });
      }
    }
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        permissions: [Permission.SUPPLIER],
        is_active: true,
      }),
    );

    const supplier = await this.suppliersRepository.save(
      this.suppliersRepository.create({
        user_id: user.id,
        company_name: dto.company_name,
        contact_email: dto.contact_email || dto.email,
        contact_phone: dto.contact_phone ?? null,
        address: dto.address ?? null,
        notes: dto.notes ?? null,
        is_active: true,
      }),
    );

    return this.findOne(supplier.id);
  }

  async findAll({
    page = 1,
    limit = 20,
    name,
    text,
    is_active,
  }: GetUsersDto): Promise<{ data: Supplier[]; total: number; page: number; limit: number }> {
    const query = this.suppliersRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.user', 'user')
      .orderBy('supplier.created_at', 'DESC');

    const searchText = text || name;
    if (searchText) {
      query.andWhere(
        '(supplier.company_name LIKE :search OR supplier.contact_email LIKE :search OR user.name LIKE :search)',
        { search: `%${searchText}%` },
      );
    }

    if (is_active !== undefined) {
      query.andWhere('supplier.is_active = :is_active', { is_active });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({
      where: { id },
      relations: ['user', 'product_mappings'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async findByUserId(userId: number): Promise<Supplier | null> {
    return this.suppliersRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  async getSuppliers(query: GetUsersDto): Promise<UserPaginator> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where("user.permissions LIKE '%supplier%'");

    const searchText = query.text || query.name;
    if (searchText) {
      queryBuilder.andWhere('(user.name LIKE :text OR user.email LIKE :text)', {
        text: `%${searchText}%`,
      });
    }

    if (query.is_active !== undefined) {
      queryBuilder.andWhere('user.is_active = :is_active', {
        is_active: query.is_active,
      });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      ...paginate(total, page, limit, data.length, `/suppliers/list?limit=${limit}`),
    };
  }

  async assignProduct(
    supplierId: number,
    dto: AssignProductSupplierDto,
  ): Promise<ProductSupplier> {
    await this.findOne(supplierId);

    const existing = await this.productSuppliersRepository.findOne({
      where: { product_id: dto.product_id },
    });

    if (existing) {
      existing.supplier_id = supplierId;
      existing.reorder_quantity = dto.reorder_quantity ?? existing.reorder_quantity;
      return this.productSuppliersRepository.save(existing);
    }

    return this.productSuppliersRepository.save(
      this.productSuppliersRepository.create({
        product_id: dto.product_id,
        supplier_id: supplierId,
        reorder_quantity: dto.reorder_quantity ?? 50,
      }),
    );
  }

  async getSupplierForProduct(productId: number): Promise<{
    supplier: Supplier;
    reorder_quantity: number;
  } | null> {
    const mapping = await this.productSuppliersRepository.findOne({
      where: { product_id: productId },
      relations: ['supplier', 'supplier.user'],
    });

    if (!mapping?.supplier?.is_active) {
      const fallback = await this.suppliersRepository.findOne({
        where: { is_active: true },
        order: { id: 'ASC' },
        relations: ['user'],
      });

      if (!fallback) {
        return null;
      }

      return { supplier: fallback, reorder_quantity: 50 };
    }

    return {
      supplier: mapping.supplier,
      reorder_quantity: mapping.reorder_quantity,
    };
  }

  async getPerformance(): Promise<SupplierPerformance[]> {
    const suppliers = await this.suppliersRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    const results: SupplierPerformance[] = [];
    for (const supplier of suppliers) {
      results.push(await this.computePerformance(supplier));
    }
    return results;
  }

  async getSupplierPerformance(id: number): Promise<SupplierPerformance> {
    const supplier = await this.findOne(id);
    return this.computePerformance(supplier);
  }

  private async computePerformance(
    supplier: Supplier,
  ): Promise<SupplierPerformance> {
    const [requests, procurements] = await Promise.all([
      this.reorderRepository.find({ where: { supplier_id: supplier.id } }),
      this.procurementRepository.find({ where: { supplier_id: supplier.id } }),
    ]);

    const total = requests.length;
    const fulfilled = requests.filter(
      (r) => r.status === ReorderRequestStatus.FULFILLED,
    ).length;
    const cancelled = requests.filter(
      (r) => r.status === ReorderRequestStatus.CANCELLED,
    ).length;
    const open = requests.filter((r) =>
      [
        ReorderRequestStatus.PENDING,
        ReorderRequestStatus.NOTIFIED,
        ReorderRequestStatus.ACKNOWLEDGED,
      ].includes(r.status),
    ).length;

    const fulfillmentRate =
      total > 0 ? Number(((fulfilled / total) * 100).toFixed(1)) : 0;

    const fulfilledRequests = requests.filter(
      (r) => r.status === ReorderRequestStatus.FULFILLED,
    );
    let avgLeadTimeHours: number | null = null;
    if (fulfilledRequests.length > 0) {
      const totalHours = fulfilledRequests.reduce((sum, r) => {
        const start = new Date(r.created_at).getTime();
        const end = new Date(r.updated_at).getTime();
        return sum + Math.max(0, end - start) / (1000 * 60 * 60);
      }, 0);
      avgLeadTimeHours = Number(
        (totalHours / fulfilledRequests.length).toFixed(1),
      );
    }

    const activeProcurements = procurements.filter(
      (p) => p.status !== ProcurementStatus.CANCELLED,
    );
    const totalProcuredQuantity = activeProcurements.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0,
    );
    const totalSpend = Number(
      activeProcurements
        .reduce((sum, p) => sum + Number(p.total_cost || 0), 0)
        .toFixed(2),
    );

    const lastOrderAt = procurements.reduce<Date | null>((latest, p) => {
      const ordered = p.ordered_at ? new Date(p.ordered_at) : null;
      if (!ordered) return latest;
      if (!latest || ordered.getTime() > latest.getTime()) return ordered;
      return latest;
    }, null);

    // Rating (0-5): weighted blend of fulfillment rate and lead-time speed.
    let rating = 0;
    if (total > 0) {
      const fulfillmentScore = fulfillmentRate / 100; // 0-1
      let speedScore = 1;
      if (avgLeadTimeHours != null) {
        // 0h -> 1, 72h+ -> 0
        speedScore = Math.max(0, 1 - avgLeadTimeHours / 72);
      }
      rating = Number((fulfillmentScore * 4 + speedScore * 1).toFixed(1));
      rating = Math.min(5, rating);
    }

    return {
      supplier_id: supplier.id,
      company_name: supplier.company_name,
      contact_email: supplier.contact_email,
      is_active: supplier.is_active,
      total_requests: total,
      fulfilled,
      cancelled,
      open,
      fulfillment_rate: fulfillmentRate,
      avg_lead_time_hours: avgLeadTimeHours,
      total_procured_quantity: totalProcuredQuantity,
      total_spend: totalSpend,
      last_order_at: lastOrderAt,
      rating,
    };
  }
}
