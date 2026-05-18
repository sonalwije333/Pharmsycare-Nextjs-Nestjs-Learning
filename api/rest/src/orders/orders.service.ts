import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { GetOrderStatusesDto, OrderStatusPaginator } from './dto/get-order-statuses.dto';
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';
import { CreateOrderStatusDto, UpdateOrderStatusDto } from './dto/create-order-status.dto';
import { CheckoutVerificationDto, VerifiedCheckoutData } from './dto/verify-checkout.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { Order } from './entities/order.entity';
import { OrderFiles } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { PaymentGatewayType, OrderStatusType, PaymentStatusType, OrderOrderByColumn, OrderStatusOrderByColumn, OrderFilesOrderByColumn } from 'src/common/enums/order-payment.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  private orderFiles: OrderFiles[] = [];

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const trackingNumber = this.generateTrackingNumber();
    const newOrder = this.orderRepository.create({
      tracking_number: trackingNumber,
      customer_contact: createOrderDto.customer_contact,
      order_status: (createOrderDto.status as unknown) as OrderStatusType,
      payment_status: PaymentStatusType.PENDING,
      amount: createOrderDto.amount,
      sales_tax: createOrderDto.sales_tax,
      total: createOrderDto.total,
      paid_total: createOrderDto.paid_total,
      discount: createOrderDto.discount,
      delivery_fee: createOrderDto.delivery_fee,
      delivery_time: createOrderDto.delivery_time,
      language: createOrderDto.language,
      payment_gateway: createOrderDto.payment_gateway || PaymentGatewayType.CASH_ON_DELIVERY,
      payment_id: createOrderDto.payment_id,
    } as Partial<Order>);

    return this.orderRepository.save(newOrder);
  }

  async findAll({
    page = 1,
    limit = 15,
    tracking_number,
    customer_id,
    shop_id,
    search,
    orderBy = OrderOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetOrdersDto): Promise<OrderPaginator> {
    let data = await this.orderRepository.find();

    if (tracking_number) {
      const trackingNumberLower = tracking_number.toLowerCase();
      data = data.filter(order =>
        order.tracking_number?.toLowerCase().includes(trackingNumberLower)
      );
    }

    if (customer_id) {
      data = data.filter(order => order.customer_id === customer_id);
    }

    if (search) {
      data = data.filter(order => 
        order.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_contact?.toLowerCase().includes(search.toLowerCase())
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case OrderOrderByColumn.AMOUNT:
        orderColumn = 'amount';
        break;
      case OrderOrderByColumn.TRACKING_NUMBER:
        orderColumn = 'tracking_number';
        break;
      case OrderOrderByColumn.UPDATED_AT:
        orderColumn = 'updated_at';
        break;
      default:
        orderColumn = 'created_at';
    }

    data.sort((a, b) => {
      const aVal = a[orderColumn as keyof Order] ?? '';
      const bVal = b[orderColumn as keyof Order] ?? '';
      return sortedBy === SortOrder.ASC ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/orders?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { tracking_number: trackingNumber } });
    if (!order) {
      throw new NotFoundException(`Order with tracking number ${trackingNumber} not found`);
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const { status, ...rest } = updateOrderDto as UpdateOrderDto & { status?: OrderStatusType };
    Object.assign(order, rest);

    if (status) {
      order.order_status = status as OrderStatusType;
    }

    order.updated_at = new Date();
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    await this.findOne(id);
    await this.orderRepository.delete(id);
    return { success: true, message: `Order #${id} removed successfully` };
  }

  async verifyCheckout(input: CheckoutVerificationDto): Promise<VerifiedCheckoutData> {
    return {
      total_tax: 0,
      shipping_charge: 0,
      unavailable_products: [],
      wallet_currency: 0,
      wallet_amount: 0,
    };
  }

  async submitPayment(orderPaymentDto: OrderPaymentDto): Promise<CoreMutationOutput> {
    const order = await this.findByTrackingNumber(orderPaymentDto.tracking_number.toString());
    order.order_status = OrderStatusType.PROCESSING;
    order.payment_status = PaymentStatusType.SUCCESS;
    return { success: true, message: 'Payment processed successfully' };
  }

  async createOrderStatus(createDto: CreateOrderStatusDto): Promise<OrderStatus> {
    const slug = createDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await this.orderStatusRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Order status with slug "${slug}" already exists`);
    }

    const newStatus = this.orderStatusRepository.create({
      name: createDto.name,
      color: createDto.color,
      serial: createDto.serial,
      slug,
      language: createDto.language,
      translated_languages: [createDto.language],
    });

    return this.orderStatusRepository.save(newStatus);
  }

  async findAllOrderStatuses({
    page = 1,
    limit = 30,
    search,
    orderBy = OrderStatusOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    let data = await this.orderStatusRepository.find();
    if (search) {
      data = data.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
    }
    let orderColumn: string;
    switch (orderBy) {
      case OrderStatusOrderByColumn.NAME:
        orderColumn = 'name';
        break;
      case OrderStatusOrderByColumn.SERIAL:
        orderColumn = 'serial';
        break;
      case OrderStatusOrderByColumn.UPDATED_AT:
        orderColumn = 'updated_at';
        break;
      default:
        orderColumn = 'created_at';
    }
    data.sort((a, b) => {
      const aVal = a[orderColumn as keyof OrderStatus] ?? '';
      const bVal = b[orderColumn as keyof OrderStatus] ?? '';
      return sortedBy === SortOrder.ASC ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/order-status?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);
    return {
      data: results,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findOrderStatusBySlug(slug: string): Promise<OrderStatus> {
    const status = await this.orderStatusRepository.findOne({ where: { slug } });
    if (!status) {
      throw new NotFoundException(`Order status with slug "${slug}" not found`);
    }
    return status;
  }

  async updateOrderStatus(id: number, updateDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const status = await this.orderStatusRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Order status with ID ${id} not found`);
    }
    
    // Debug: log incoming update
    console.log('[OrdersService] updateOrderStatus called', { id, updateDto });

    // Check if the new slug would conflict with another status
    if (updateDto.name) {
      const newSlug = updateDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (newSlug !== status.slug) {
        const existing = await this.orderStatusRepository.findOne({ where: { slug: newSlug } });
        if (existing) {
          throw new ConflictException(`Order status with slug "${newSlug}" already exists`);
        }
      }
      status.slug = newSlug;
    }

    Object.assign(status, updateDto);
    const saved = await this.orderStatusRepository.save(status);
    console.log('[OrdersService] updateOrderStatus saved', { id: saved.id, slug: saved.slug });
    return saved;
  }

  async removeOrderStatus(id: number): Promise<CoreMutationOutput> {
    const status = await this.orderStatusRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Order status with ID ${id} not found`);
    }
    await this.orderStatusRepository.delete(id);
    return { success: true, message: `Order status #${id} removed successfully` };
  }

  async findAllOrderFiles({
    page = 1,
    limit = 30,
    orderBy = OrderFilesOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetOrderFilesDto): Promise<OrderFilesPaginator> {
    let data = [...this.orderFiles];
    let orderColumn: string;
    switch (orderBy) {
      case OrderFilesOrderByColumn.UPDATED_AT:
        orderColumn = 'updated_at';
        break;
      default:
        orderColumn = 'created_at';
    }
    data.sort((a, b) => {
      const aVal = a[orderColumn as keyof OrderFiles] ?? '';
      const bVal = b[orderColumn as keyof OrderFiles] ?? '';
      return sortedBy === SortOrder.ASC ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/downloads?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);
    return {
      data: results,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async getDigitalFileDownloadUrl(digitalFileId: number): Promise<{ url: string }> {
    const file = this.orderFiles.find(f => f.digital_file_id === digitalFileId);
    if (!file) {
      throw new NotFoundException(`Digital file with ID ${digitalFileId} not found`);
    }
    return { url: 'https://example.com/file.pdf' };
  }

  async exportOrder(shop_id?: string): Promise<{ url: string }> {
    return { url: 'https://example.com/orders.xlsx' };
  }

  async downloadInvoiceUrl(shop_id?: string): Promise<{ url: string }> {
    return { url: 'https://example.com/invoice.pdf' };
  }

  private generateTrackingNumber(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}