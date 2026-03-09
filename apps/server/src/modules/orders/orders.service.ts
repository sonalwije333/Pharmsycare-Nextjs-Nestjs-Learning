import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity';
import { OrderFiles } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from './dto/create-order-status.dto';
import {
  GetOrderStatusesDto,
  OrderStatusPaginator,
} from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';
import {
  CheckoutVerificationDto,
  VerifiedCheckoutData,
} from './dto/verify-checkout.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { paginate } from '../common/pagination/paginate';
import {
  OrderNotFoundException,
  OrderStatusNotFoundException,
} from './exceptions/order-not-found.exception';
import {
  OrderStatusType,
  PaymentStatusType,
  PaymentGatewayType,
  QueryOrdersOrderByColumn,
  QueryOrderStatusesOrderByColumn,
  QueryOrderFilesOrderByColumn,
} from '../../common/enums/enums';
import { SortOrder } from '../common/dto/generic-conditions.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(OrderFiles)
    private readonly orderFilesRepository: Repository<OrderFiles>,
  ) {}

  // ==================== ORDER METHODS ====================

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate unique tracking number
    const trackingNumber =
      'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Get default order status
    const defaultStatus = await this.orderStatusRepository.findOne({
      where: { slug: 'pending' },
    });

    if (!defaultStatus) {
      throw new NotFoundException('Default order status not found');
    }

    // Set order status and payment status based on payment gateway
    const paymentGateway =
      createOrderDto.payment_gateway || PaymentGatewayType.CASH_ON_DELIVERY;
    let orderStatus = OrderStatusType.PENDING;
    let paymentStatus = PaymentStatusType.PENDING;

    switch (paymentGateway) {
      case PaymentGatewayType.CASH_ON_DELIVERY:
        orderStatus = OrderStatusType.PROCESSING;
        paymentStatus = PaymentStatusType.CASH_ON_DELIVERY;
        break;
      case PaymentGatewayType.CASH:
        orderStatus = OrderStatusType.PROCESSING;
        paymentStatus = PaymentStatusType.CASH;
        break;
      case PaymentGatewayType.FULL_WALLET_PAYMENT:
        orderStatus = OrderStatusType.COMPLETED;
        paymentStatus = PaymentStatusType.WALLET;
        break;
      default:
        orderStatus = OrderStatusType.PENDING;
        paymentStatus = PaymentStatusType.PENDING;
        break;
    }

    const { products, ...orderData } = createOrderDto;
    
    const order = this.orderRepository.create({
      ...orderData,
      tracking_number: trackingNumber,
      status: defaultStatus,
      order_status: orderStatus,
      payment_status: paymentStatus,
      payment_gateway: paymentGateway,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Process children orders if any
    if (savedOrder.children && savedOrder.children.length > 0) {
      const updatedChildren = await this.processChildrenOrder(savedOrder);
      savedOrder.children = updatedChildren;
    }

    return savedOrder;
  }

  async getOrders({
    page = 1,
    limit = 30,
    search,
    customer_id,
    shop_id,
    tracking_number,
    orderBy = QueryOrdersOrderByColumn.CREATED_AT,
    sortOrder = SortOrder.DESC,
  }: GetOrdersDto): Promise<OrderPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.status', 'status')
      .leftJoinAndSelect('order.products', 'products')
      .leftJoinAndSelect('order.coupon', 'coupon');

    if (search) {
      queryBuilder.andWhere('order.tracking_number LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (customer_id) {
      queryBuilder.andWhere('order.customer_id = :customer_id', {
        customer_id,
      });
    }

    if (shop_id) {
      queryBuilder.andWhere('shop.id = :shop_id', {
        shop_id: parseInt(shop_id),
      });
    }

    if (tracking_number) {
      queryBuilder.andWhere('order.tracking_number = :tracking_number', {
        tracking_number,
      });
    }

    // Apply ordering
    const orderField = this.getOrderOrderByColumn(orderBy);
    queryBuilder.orderBy(
      `order.${orderField}`,
      sortOrder === SortOrder.ASC ? 'ASC' : 'DESC',
    );

    const [results, total] = await queryBuilder
      .take(take)
      .skip(skip)
      .getManyAndCount();

    const url = `/orders?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'shop',
        'status',
        'products',
        'coupon',
        'children',
      ],
    });

    if (!order) {
      throw new OrderNotFoundException(id.toString());
    }

    return order;
  }

  async getOrderByTrackingNumber(trackingNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { tracking_number: trackingNumber },
      relations: [
        'customer',
        'shop',
        'status',
        'products',
        'coupon',
        'children',
      ],
    });

    if (!order) {
      throw new OrderNotFoundException(trackingNumber);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.getOrderById(id);

    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.getOrderById(id);
    await this.orderRepository.remove(order);
  }

  async verifyCheckout(
    verificationDto: CheckoutVerificationDto,
  ): Promise<VerifiedCheckoutData> {
    // Implement checkout verification logic
    return {
      total_tax: verificationDto.amount * 0.1,
      shipping_charge: 5.99,
      unavailable_products: [],
      wallet_currency: 'USD',
      wallet_amount: 0,
    };
  }

  async submitPayment(orderPaymentDto: OrderPaymentDto): Promise<void> {
    const order = await this.getOrderByTrackingNumber(
      orderPaymentDto.tracking_number.toString(),
    );

    // Process payment based on gateway
    switch (order.payment_gateway?.toString().toLowerCase()) {
      case 'stripe':
        await this.processStripePayment(order);
        break;
      case 'paypal':
        await this.processPaypalPayment(order);
        break;
      default:
        order.payment_status = PaymentStatusType.SUCCESS;
        order.order_status = OrderStatusType.PROCESSING;
        await this.orderRepository.save(order);
    }
  }

  private async processStripePayment(order: Order): Promise<void> {
    order.payment_status = PaymentStatusType.SUCCESS;
    order.order_status = OrderStatusType.PROCESSING;
    order.payment_id = 'stripe_' + Date.now();
    await this.orderRepository.save(order);
  }

  private async processPaypalPayment(order: Order): Promise<void> {
    order.payment_status = PaymentStatusType.SUCCESS;
    order.order_status = OrderStatusType.PROCESSING;
    order.payment_id = 'paypal_' + Date.now();
    await this.orderRepository.save(order);
  }

  async processChildrenOrder(parentOrder: Order): Promise<Order[]> {
    if (!parentOrder.children || parentOrder.children.length === 0) {
      return [];
    }

    const children = parentOrder.children.map((child) => {
      child.order_status = parentOrder.order_status;
      child.payment_status = parentOrder.payment_status;
      child.parent_order = parentOrder;
      return child;
    });

    return await this.orderRepository.save(children);
  }

  private getOrderOrderByColumn(orderBy: QueryOrdersOrderByColumn): string {
    switch (orderBy) {
      case QueryOrdersOrderByColumn.TOTAL:
        return 'total';
      case QueryOrdersOrderByColumn.TRACKING_NUMBER:
        return 'tracking_number';
      case QueryOrdersOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryOrdersOrderByColumn.CREATED_AT:
      default:
        return 'created_at';
    }
  }

  // ==================== ORDER STATUS METHODS ====================

  async createOrderStatus(
    createOrderStatusDto: CreateOrderStatusDto,
  ): Promise<OrderStatus> {
    // Check if slug already exists
    const slugExists = await this.orderStatusRepository.findOne({
      where: { slug: createOrderStatusDto.slug },
    });
    if (slugExists) {
      throw new BadRequestException('Order status slug already exists');
    }

    const orderStatus = this.orderStatusRepository.create({
      ...createOrderStatusDto,
      language: createOrderStatusDto.language || 'en',
      translated_languages: createOrderStatusDto.translated_languages || [],
    });

    return await this.orderStatusRepository.save(orderStatus);
  }

  async getOrderStatuses({
    page = 1,
    limit = 30,
    search,
    language,
    orderBy = QueryOrderStatusesOrderByColumn.SERIAL,
    sortOrder = SortOrder.ASC,
  }: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (language) {
      where.language = language;
    }

    const orderField = this.getOrderStatusOrderByColumn(orderBy);
    const order = {
      [orderField]: sortOrder === SortOrder.ASC ? 'ASC' : 'DESC',
    };

    const [results, total] = await this.orderStatusRepository.findAndCount({
      where,
      take,
      skip,
      order,
    });

    const url = `/order-status?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getOrderStatusById(id: number): Promise<OrderStatus> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { id },
    });

    if (!orderStatus) {
      throw new OrderStatusNotFoundException(id.toString());
    }

    return orderStatus;
  }

  async getOrderStatusBySlug(
    slug: string,
    language?: string,
  ): Promise<OrderStatus> {
    const where: any = { slug };

    if (language) {
      where.language = language;
    }

    const orderStatus = await this.orderStatusRepository.findOne({ where });

    if (!orderStatus) {
      throw new OrderStatusNotFoundException(slug);
    }

    return orderStatus;
  }

  async updateOrderStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderStatus> {
    const orderStatus = await this.getOrderStatusById(id);

    // Check if new slug already exists (if slug is being updated)
    if (
      updateOrderStatusDto.slug &&
      updateOrderStatusDto.slug !== orderStatus.slug
    ) {
      const slugExists = await this.orderStatusRepository.findOne({
        where: { slug: updateOrderStatusDto.slug },
      });
      if (slugExists) {
        throw new BadRequestException('Order status slug already exists');
      }
    }

    const updated = this.orderStatusRepository.merge(
      orderStatus,
      updateOrderStatusDto,
    );
    return await this.orderStatusRepository.save(updated);
  }

  async deleteOrderStatus(id: number): Promise<void> {
    const orderStatus = await this.getOrderStatusById(id);

    // Check if any orders are using this status
    const ordersUsingStatus = await this.orderRepository.count({
      where: { status: { id } },
    });

    if (ordersUsingStatus > 0) {
      throw new BadRequestException(
        'Cannot delete order status that is in use by orders',
      );
    }

    await this.orderStatusRepository.remove(orderStatus);
  }

  private getOrderStatusOrderByColumn(orderBy: QueryOrderStatusesOrderByColumn): string {
    switch (orderBy) {
      case QueryOrderStatusesOrderByColumn.NAME:
        return 'name';
      case QueryOrderStatusesOrderByColumn.SERIAL:
        return 'serial';
      case QueryOrderStatusesOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryOrderStatusesOrderByColumn.CREATED_AT:
      default:
        return 'created_at';
    }
  }

  private getOrderFilesOrderByColumn(orderBy: QueryOrderFilesOrderByColumn): string {
    switch (orderBy) {
      case QueryOrderFilesOrderByColumn.NAME:
        return 'name';
      case QueryOrderFilesOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryOrderFilesOrderByColumn.CREATED_AT:
      default:
        return 'created_at';
    }
  }

  // ==================== ORDER FILES METHODS ====================

  async getOrderFiles({
    page = 1,
    limit = 30,
    orderBy = QueryOrderFilesOrderByColumn.CREATED_AT,
    sortOrder = SortOrder.DESC,
  }: GetOrderFilesDto): Promise<OrderFilesPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const orderField = this.getOrderFilesOrderByColumn(orderBy);
    const order = {
      [orderField]: sortOrder === SortOrder.ASC ? 'ASC' : 'DESC',
    } as any;

    const [results, total] = await this.orderFilesRepository.findAndCount({
      take,
      skip,
      order,
      relations: ['order'],
    });

    const url = `/downloads?limit=${limit}&page=${page}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getDigitalFileDownloadUrl(
    digitalFileId: number,
  ): Promise<{ url: string }> {
    const orderFile = await this.orderFilesRepository.findOne({
      where: { digital_file_id: digitalFileId },
    });

    if (!orderFile) {
      throw new NotFoundException(
        `Digital file with ID ${digitalFileId} not found`,
      );
    }

    return { url: `/api/downloads/files/${digitalFileId}` };
  }

  async exportOrder(shop_id: string): Promise<{ url: string }> {
    return { url: `/api/export/orders/${shop_id}` };
  }

  async downloadInvoiceUrl(shop_id: string): Promise<{ url: string }> {
    return { url: `/api/invoice/download/${shop_id}` };
  }
}
