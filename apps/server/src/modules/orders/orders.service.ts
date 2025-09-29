import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity';
import { CreateOrderStatusDto, UpdateOrderStatusDto } from './dto/create-order-status.dto';
import { GetOrderStatusesDto, OrderStatusPaginator } from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator, GetOrderArgs } from './dto/get-orders.dto';
import { paginate } from '../common/pagination/paginate';
import { OrderNotFoundException, OrderStatusNotFoundException } from './exceptions/order-not-found.exception';
import {OrderStatusType} from "../../common/enums/enums";
import { SortOrder } from '../common/dto/generic-conditions.dto';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
  ) {}

  // Order Status Methods
  async createOrderStatus(createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = this.orderStatusRepository.create({
      ...createOrderStatusDto,
      language: createOrderStatusDto.language || 'en',
      translated_languages: createOrderStatusDto.language ? [createOrderStatusDto.language] : ['en'],
    });

    return await this.orderStatusRepository.save(orderStatus);
  }

  async getOrderStatuses({
                           page = 1,
                           limit = 30,
                           search,
                           language,
                           orderBy,
                           sortOrder = SortOrder.ASC
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

    let order = {};
    if (orderBy) {
      const column = this.getOrderStatusOrderByColumn(orderBy);
      order[column] = sortOrder;
    } else {
      order = { serial: 'ASC' }; // Default order by serial
    }

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

  private getOrderStatusOrderByColumn(orderBy: any): string {
    switch (orderBy) {
      case 'NAME':
        return 'name';
      case 'SERIAL':
        return 'serial';
      case 'UPDATED_AT':
        return 'updated_at';
      case 'CREATED_AT':
      default:
        return 'created_at';
    }
  }

  async getOrderStatusById(id: number): Promise<OrderStatus> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { id }
    });

    if (!orderStatus) {
      throw new OrderStatusNotFoundException(id.toString());
    }

    return orderStatus;
  }

  async getOrderStatusBySlug(slug: string, language?: string): Promise<OrderStatus> {
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

  async updateOrderStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = await this.orderStatusRepository.findOneBy({ id });

    if (!orderStatus) {
      throw new OrderStatusNotFoundException(id.toString());
    }

    const updated = this.orderStatusRepository.merge(orderStatus, updateOrderStatusDto);
    return this.orderStatusRepository.save(updated);
  }

  async deleteOrderStatus(id: number): Promise<void> {
    const orderStatus = await this.orderStatusRepository.findOneBy({ id });

    if (!orderStatus) {
      throw new OrderStatusNotFoundException(id.toString());
    }

    await this.orderStatusRepository.remove(orderStatus);
  }

  // Order Methods
  async getOrders({
                    page = 1,
                    limit = 30,
                    search,
                    customer_id,
                    shop_id,
                    tracking_number,
                    orderBy,
                    sortOrder = SortOrder.DESC
                  }: GetOrdersDto): Promise<OrderPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where: any = {};

    if (search) {
      where.tracking_number = Like(`%${search}%`);
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (shop_id) {
      where.shop = { id: shop_id };
    }

    if (tracking_number) {
      where.tracking_number = tracking_number;
    }

    let order = {};
    if (orderBy) {
      const column = this.getOrderOrderByColumn(orderBy);
      order[column] = sortOrder;
    } else {
      order = { created_at: sortOrder };
    }

    const [results, total] = await this.orderRepository.findAndCount({
      where,
      take,
      skip,
      order,
      relations: ['customer', 'shop', 'status', 'payment_intent'],
    });

    const url = `/orders?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  private getOrderOrderByColumn(orderBy: any): string {
    switch (orderBy) {
      case 'TOTAL':
        return 'total';
      case 'TRACKING_NUMBER':
        return 'tracking_number';
      case 'UPDATED_AT':
        return 'updated_at';
      case 'CREATED_AT':
      default:
        return 'created_at';
    }
  }

  async getOrderByIdOrTrackingNumber(identifier: number | string): Promise<Order> {
    let where: any = {};

    if (typeof identifier === 'number') {
      where = { id: identifier };
    } else {
      where = { tracking_number: identifier };
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['customer', 'shop', 'status', 'payment_intent', 'products', 'coupon'],
    });

    if (!order) {
      throw new OrderNotFoundException(identifier.toString());
    }

    return order;
  }

  async updateOrderStatusById(orderId: number, statusId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['status']
    });

    if (!order) {
      throw new OrderNotFoundException(orderId.toString());
    }

    const status = await this.orderStatusRepository.findOneBy({ id: statusId });

    if (!status) {
      throw new OrderStatusNotFoundException(statusId.toString());
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async getOrderStats(shop_id?: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    revenue: number;
  }> {
    const where: any = {};
    if (shop_id) {
      where.shop = { id: shop_id };
    }

    const [total, pending, processing, completed, cancelled, allOrders] = await Promise.all([
      this.orderRepository.count({ where }),
      this.orderRepository.count({ where: { ...where, order_status: OrderStatusType.PENDING } }),
      this.orderRepository.count({ where: { ...where, order_status: OrderStatusType.PROCESSING } }),
      this.orderRepository.count({ where: { ...where, order_status: OrderStatusType.COMPLETED } }),
      this.orderRepository.count({ where: { ...where, order_status: OrderStatusType.CANCELLED } }),
      this.orderRepository.find({ where, select: ['total'] }),
    ]);

    const revenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    return {
      total,
      pending,
      processing,
      completed,
      cancelled,
      revenue,
    };
  }

  async getOrdersByStatus(status: OrderStatusType, shop_id?: string): Promise<Order[]> {
    const where: any = { order_status: status };

    if (shop_id) {
      where.shop = { id: shop_id };
    }

    return this.orderRepository.find({
      where,
      relations: ['customer', 'shop', 'status'],
      order: { created_at: 'DESC' },
    });
  }
}