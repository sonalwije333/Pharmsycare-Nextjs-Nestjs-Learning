import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProcurementHistoryService } from '../procurement-history/procurement-history.service';
import { ReorderNotificationService } from './reorder-notification.service';
import {
  ReorderNotificationChannel,
  ReorderRequest,
  ReorderRequestStatus,
} from './entities/reorder-request.entity';
import { GetReorderRequestsDto } from './dto/get-reorder-requests.dto';
import { User } from '../users/entities/user.entity';
import { Permission } from '../common/enums/enums';

const AUTO_REORDER_INTERVAL_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class ReorderRequestsService implements OnModuleInit {
  private readonly logger = new Logger(ReorderRequestsService.name);
  private autoTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(ReorderRequest)
    private reorderRepository: Repository<ReorderRequest>,
    private productsService: ProductsService,
    private suppliersService: SuppliersService,
    private notificationService: ReorderNotificationService,
    private procurementService: ProcurementHistoryService,
  ) {}

  onModuleInit(): void {
    this.autoTimer = setInterval(() => {
      this.runAutoReorder().catch((error) => {
        this.logger.error('Auto reorder failed', error);
      });
    }, AUTO_REORDER_INTERVAL_MS);

    setTimeout(() => {
      this.runAutoReorder().catch((error) => {
        this.logger.error('Initial auto reorder failed', error);
      });
    }, 15000);
  }

  async runAutoReorder(): Promise<{
    scanned: number;
    created: number;
    notified: number;
  }> {
    const stockPage = this.productsService.getProductsStock({
      page: 1,
      limit: 500,
    });

    let created = 0;
    let notified = 0;

    for (const product of stockPage.data) {
      const supplierInfo = await this.suppliersService.getSupplierForProduct(
        Number(product.id),
      );

      if (!supplierInfo) {
        continue;
      }

      const existingPending = await this.reorderRepository.findOne({
        where: {
          product_id: Number(product.id),
          status: In([
            ReorderRequestStatus.PENDING,
            ReorderRequestStatus.NOTIFIED,
            ReorderRequestStatus.ACKNOWLEDGED,
          ]),
        },
      });

      if (existingPending) {
        continue;
      }

      const reorder = await this.reorderRepository.save(
        this.reorderRepository.create({
          product_id: Number(product.id),
          product_name: product.name,
          sku: product.sku ?? null,
          shop_id: (product as any).shop_id ?? product.shop?.id ?? null,
          supplier_id: supplierInfo.supplier.id,
          requested_quantity: supplierInfo.reorder_quantity,
          current_stock: product.quantity,
          current_quantity: product.quantity,
          is_automated: true,
          status: ReorderRequestStatus.PENDING,
          notification_channel: ReorderNotificationChannel.BOTH,
        }),
      );

      created += 1;
      await this.notifySupplier(reorder.id);
      notified += 1;
    }

    this.logger.log(
      `Auto reorder complete: scanned=${stockPage.data.length}, created=${created}, notified=${notified}`,
    );

    return {
      scanned: stockPage.data.length,
      created,
      notified,
    };
  }

  async notifySupplier(reorderId: number): Promise<ReorderRequest> {
    const reorder = await this.reorderRepository.findOne({
      where: { id: reorderId },
      relations: ['supplier', 'supplier.user'],
    });

    if (!reorder) {
      throw new NotFoundException(`Reorder request ${reorderId} not found`);
    }

    const supplier = await this.suppliersService.findOne(reorder.supplier_id);
    const { emailLog, contactLog } = await this.notificationService.sendReorderAlert(
      supplier,
      reorder,
    );

    reorder.notification_message = [
      `Low stock reorder for ${reorder.product_name}.`,
      `Current quantity: ${reorder.current_quantity}.`,
      `Please supply ${reorder.requested_quantity} units.`,
    ].join(' ');

    reorder.email_delivery_log = emailLog;
    reorder.contact_message_log = contactLog;
    reorder.status = ReorderRequestStatus.NOTIFIED;
    reorder.notified_at = new Date();

    return this.reorderRepository.save(reorder);
  }

  async findAll(
    query: GetReorderRequestsDto,
    user?: User,
  ): Promise<{ data: ReorderRequest[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.reorderRepository
      .createQueryBuilder('reorder')
      .leftJoinAndSelect('reorder.supplier', 'supplier')
      .leftJoinAndSelect('supplier.user', 'user')
      .orderBy('reorder.created_at', 'DESC');

    if (query.status) {
      qb.andWhere('reorder.status = :status', { status: query.status });
    }

    if (query.supplier_id) {
      qb.andWhere('reorder.supplier_id = :supplier_id', {
        supplier_id: query.supplier_id,
      });
    }

    if (query.shop_id) {
      qb.andWhere('reorder.shop_id = :shop_id', { shop_id: query.shop_id });
    }

    if (user?.permissions?.includes(Permission.SUPPLIER)) {
      const supplier = await this.suppliersService.findByUserId(user.id);
      if (!supplier) {
        return { data: [], total: 0, page, limit };
      }
      qb.andWhere('reorder.supplier_id = :supplierId', { supplierId: supplier.id });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getStats(user?: User): Promise<{
    pending: number;
    notified: number;
    total_open: number;
  }> {
    const where: Partial<{ supplier_id: number }> = {};

    if (user?.permissions?.includes(Permission.SUPPLIER)) {
      const supplier = await this.suppliersService.findByUserId(user.id);
      if (!supplier) {
        return { pending: 0, notified: 0, total_open: 0 };
      }
      where.supplier_id = supplier.id;
    }

    const [pending, notified] = await Promise.all([
      this.reorderRepository.count({
        where: { ...where, status: ReorderRequestStatus.PENDING },
      }),
      this.reorderRepository.count({
        where: { ...where, status: ReorderRequestStatus.NOTIFIED },
      }),
    ]);

    return {
      pending,
      notified,
      total_open: pending + notified,
    };
  }

  async updateStatus(
    id: number,
    status: ReorderRequestStatus,
    user?: User,
  ): Promise<ReorderRequest> {
    const reorder = await this.reorderRepository.findOne({ where: { id } });
    if (!reorder) {
      throw new NotFoundException(`Reorder request ${id} not found`);
    }

    if (user?.permissions?.includes(Permission.SUPPLIER)) {
      const supplier = await this.suppliersService.findByUserId(user.id);
      if (!supplier || reorder.supplier_id !== supplier.id) {
        throw new NotFoundException(`Reorder request ${id} not found`);
      }
    }

    reorder.status = status;
    const saved = await this.reorderRepository.save(reorder);

    if (status === ReorderRequestStatus.FULFILLED) {
      try {
        await this.procurementService.recordFromReorder({
          id: saved.id,
          supplier_id: saved.supplier_id,
          product_id: saved.product_id,
          product_name: saved.product_name,
          sku: saved.sku,
          requested_quantity: saved.requested_quantity,
        });
      } catch (error) {
        this.logger.error(
          `Failed to record procurement history for reorder ${saved.id}`,
          error as Error,
        );
      }
    }

    return saved;
  }
}
