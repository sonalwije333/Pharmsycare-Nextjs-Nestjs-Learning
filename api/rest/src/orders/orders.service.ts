// orders/orders.service.ts
import exportOrderJson from '@db/order-export.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import orderStatusJson from '@db/order-statuses.json';
import ordersJson from '@db/orders.json';
import paymentGatewayJson from '@db/payment-gateway.json';
import paymentIntentJson from '@db/payment-intent.json';
import setting from '@db/settings.json';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { AuthService } from 'src/auth/auth.service';
import { paginate } from 'src/common/pagination/paginate';
import { Setting } from 'src/settings/entities/setting.entity';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from './dto/create-order-status.dto';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import {
  GetOrderFilesDto,
  QueryOrderFilesOrderByColumn,
} from './dto/get-downloads.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  GetOrderStatusesDto,
  OrderStatusPaginator,
  QueryOrderStatusesOrderByColumn,
} from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { GetOrderArgs } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  CheckoutVerificationDto,
  VerifiedCheckoutData,
} from './dto/verify-checkout.dto';
import { OrderStatus } from './entities/order-status.entity';
import {
  Order,
  OrderFiles,
  OrderStatusType,
  PaymentGatewayType,
  PaymentStatusType,
} from './entities/order.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { PaymentIntent } from 'src/payment-intent/entities/payment-intent.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';

const orders = plainToClass(Order, ordersJson);
const paymentIntents: PaymentIntent[] = plainToClass(
  PaymentIntent,
  ((paymentIntentJson as unknown as { payment_intents?: unknown[] }).payment_intents ?? []) as unknown[],
);
const paymentGateways: PaymentGateWay[] = plainToClass(
  PaymentGateWay,
  ((paymentGatewayJson as unknown as { payment_gateways?: unknown[] }).payment_gateways ?? []) as unknown[],
);
const orderStatus = plainToClass(OrderStatus, orderStatusJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(orderStatus, options);

const orderFiles = plainToClass(OrderFiles, orderFilesJson);
const settings = plainToClass(Setting, setting);

@Injectable()
export class OrdersService {
  private orders: Order[] = orders;
  private orderStatus: OrderStatus[] = orderStatus;
  private orderFiles: OrderFiles[] = orderFiles;
  private setting: Setting = { ...settings };

  constructor(private readonly authService: AuthService) {}
  
  async create(createOrderInput: CreateOrderDto): Promise<Order> {
    const order: Order = this.orders[0];
    const payment_gateway_type = createOrderInput.payment_gateway
      ? createOrderInput.payment_gateway
      : PaymentGatewayType.CASH_ON_DELIVERY;
    order.payment_gateway = payment_gateway_type;
    // order.payment_intent = null; // Commented for future use
    
    switch (payment_gateway_type) {
      case PaymentGatewayType.CASH_ON_DELIVERY:
        order.order_status = OrderStatusType.PROCESSING;
        order.payment_status = PaymentStatusType.CASH_ON_DELIVERY;
        break;
      case PaymentGatewayType.CASH:
        order.order_status = OrderStatusType.PROCESSING;
        order.payment_status = PaymentStatusType.CASH;
        break;
      case PaymentGatewayType.FULL_WALLET_PAYMENT:
        order.order_status = OrderStatusType.COMPLETED;
        order.payment_status = PaymentStatusType.WALLET;
        break;
      default:
        order.order_status = OrderStatusType.PENDING;
        order.payment_status = PaymentStatusType.PENDING;
        break;
    }
    order.children = this.processChildrenOrder(order); 
    
    try {
      if (
        [
          PaymentGatewayType.STRIPE,
          PaymentGatewayType.PAYPAL,
          PaymentGatewayType.RAZORPAY,
        ].includes(payment_gateway_type)
      ) {
        const paymentIntent = await this.processPaymentIntent(
          order,
          this.setting,
        );
        order.payment_intent = paymentIntent;
      }
      return order;
    } catch (error) {
      return order;
    }
    
    return order;
  }

  async getOrders({
    limit,
    page,
    customer_id,
    tracking_number,
    search,
    shop_id,
    orderBy = 'created_at',
    sortedBy = 'desc',
  }: GetOrdersDto): Promise<OrderPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 15;
    
    let data: Order[] = [...this.orders];

    // Filter by customer_id
    if (customer_id) {
      data = data.filter((order) => order.customer_id === customer_id);
    }

    // Filter by tracking_number
    if (tracking_number) {
      const trackingNumberValue = tracking_number.toString().trim();
      data = data.filter(
        (order) => String(order.tracking_number ?? '').trim() === trackingNumberValue,
      );
    }

    // Filter by shop_id 
    if (shop_id && shop_id !== 'undefined') {
      data = this.orders?.filter((p) => p?.shop?.id === Number(shop_id));
    }

    // Search functionality
    if (search) {
      const rawSearchParams = search.split(';').filter(Boolean);
      let trackingNumberSearch: string | undefined;
      let customerContactSearch: string | undefined;
      let plainSearch: string | undefined;

      for (const rawParam of rawSearchParams) {
        const separatorIndex = rawParam.indexOf(':');
        if (separatorIndex === -1) {
          plainSearch = rawParam.trim();
          continue;
        }

        const key = rawParam.slice(0, separatorIndex).trim();
        const value = rawParam.slice(separatorIndex + 1).trim();

        if (!value) continue;

        if (key === 'tracking_number') {
          trackingNumberSearch = value;
          continue;
        }

        if (key === 'customer_contact') {
          customerContactSearch = value;
          continue;
        }
      }

      if (trackingNumberSearch) {
        const normalizedTrackingSearch = trackingNumberSearch.toLowerCase();
        data = data.filter((order) =>
          String(order.tracking_number ?? '').toLowerCase().includes(normalizedTrackingSearch),
        );
      }

      if (customerContactSearch) {
        const normalizedContactSearch = customerContactSearch.toLowerCase();
        data = data.filter((order) =>
          String(order.customer_contact ?? '').toLowerCase().includes(normalizedContactSearch),
        );
      }

      if (!trackingNumberSearch && !customerContactSearch) {
        const fallbackSearch = (plainSearch ?? search).toLowerCase();
        data = data.filter(
          (order) =>
            String(order.tracking_number ?? '').toLowerCase().includes(fallbackSearch) ||
            String(order.customer_contact ?? '').toLowerCase().includes(fallbackSearch),
        );
      }
    }

    // Sort data
    const sortDirection = sortedBy?.toString().toLowerCase() === 'asc' ? 'asc' : 'desc';
    data.sort((a, b) => {
      const aValue = a[orderBy as keyof Order];
      const bValue = b[orderBy as keyof Order];
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/orders?search=${search}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getOrderByIdOrTrackingNumber(id: number): Promise<Order> {
    const order = this.orders.find(
      (o: Order) =>
        o.id === Number(id) || o.tracking_number === id.toString(),
    );
    
    if (!order) {
      throw new NotFoundException(`Order with ID or tracking number ${id} not found`);
    }
    
    return order;
  }

  async getOrderByArgs(args: GetOrderArgs): Promise<Order> {
    const { id, tracking_number } = args;
    
    if (id) {
      return this.getOrderByIdOrTrackingNumber(id);
    }
    
    if (tracking_number) {
      return this.getOrderByIdOrTrackingNumber(parseInt(tracking_number));
    }
    
    throw new NotFoundException('Order ID or tracking number is required');
  }

  getOrderStatuses({
    limit,
    page,
    search,
    orderBy = QueryOrderStatusesOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetOrderStatusesDto): OrderStatusPaginator {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: OrderStatus[] = [...this.orderStatus];

    if (search) {
      data = data.filter((status) => 
        status.name?.toLowerCase().includes(search.toLowerCase()) ||
        status.slug?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort data
    data.sort((a, b) => {
      const aValue = a[orderBy.toLowerCase() as keyof OrderStatus];
      const bValue = b[orderBy.toLowerCase() as keyof OrderStatus];
      if (sortedBy === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/order-status?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getOrderStatus(param: string, language: string): OrderStatus {
    const status = this.orderStatus.find((p) => p.slug === param);
    
    if (!status) {
      throw new NotFoundException(`Order status with slug "${param}" not found`);
    }
    
    return status;
  }

  update(id: number, updateOrderInput: UpdateOrderDto): CoreMutationOutput {
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    
    if (orderIndex === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    // Update order properties
    this.orders[orderIndex] = {
      ...this.orders[orderIndex],
      ...updateOrderInput,
      status: typeof updateOrderInput.status === 'string' 
        ? (updateOrderInput.status as any)
        : updateOrderInput.status,
    } as Order;
    
    return {
      success: true,
      message: 'Order updated successfully',
    };
  }

  remove(id: number): CoreMutationOutput {
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    
    if (orderIndex === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    this.orders.splice(orderIndex, 1);
    
    return {
      success: true,
      message: `Order #${id} removed successfully`,
    };
  }

  verifyCheckout(input: CheckoutVerificationDto): VerifiedCheckoutData {
    // TODO: Implement checkout verification logic
    return {
      total_tax: 0,
      shipping_charge: 0,
      unavailable_products: [],
      wallet_currency: 0,
      wallet_amount: 0,
    };
  }

  createOrderStatus(createOrderStatusInput: CreateOrderStatusDto): OrderStatus {
    const newStatus: OrderStatus = {
      id: this.orderStatus.length + 1,
      ...createOrderStatusInput,
      slug: createOrderStatusInput.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      translated_languages: [createOrderStatusInput.language || 'en'],
      created_at: new Date(),
      updated_at: new Date(),
    } as OrderStatus;
    
    this.orderStatus.push(newStatus);
    
    return newStatus;
  }

  updateOrderStatus(id: number, updateOrderStatusInput: UpdateOrderStatusDto): CoreMutationOutput {
    const statusIndex = this.orderStatus.findIndex((status) => status.id === id);
    
    if (statusIndex === -1) {
      throw new NotFoundException(`Order status with ID ${id} not found`);
    }
    
    this.orderStatus[statusIndex] = {
      ...this.orderStatus[statusIndex],
      ...updateOrderStatusInput,
      updated_at: new Date(),
    };
    
    return {
      success: true,
      message: 'Order status updated successfully',
    };
  }

  async getOrderFileItems({ page, limit, orderBy = QueryOrderFilesOrderByColumn.CREATED_AT, sortedBy = SortOrder.DESC }: GetOrderFilesDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: OrderFiles[] = [...orderFiles];
    
    // Sort data
    data.sort((a, b) => {
      const aValue = a[orderBy.toLowerCase() as keyof OrderFiles];
      const bValue = b[orderBy.toLowerCase() as keyof OrderFiles];
      if (sortedBy === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/downloads?&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getDigitalFileDownloadUrl(digitalFileId: number): Promise<string> {
    const item = this.orderFiles.find(
      (singleItem) => singleItem.digital_file_id === digitalFileId,
    );
    
    if (!item) {
      throw new NotFoundException(`Digital file with ID ${digitalFileId} not found`);
    }
    
    return item.file.url; 
    return 'https://example.com/file.pdf';
  }

  async exportOrder(shop_id: string): Promise<{ url: string }> {
    return { url: exportOrderJson.url };
  }

  async downloadInvoiceUrl(shop_id: string): Promise<{ url: string }> {
    return { url: orderInvoiceJson[0]?.url || '' };
  }

  processChildrenOrder(order: Order): Order[] {
   
    return [];
    return [...(order.children || [])].map((child) => {
      child.order_status = order.order_status;
      child.payment_status = order.payment_status;
      return child;
    });
  }


  async processPaymentIntent(
    order: Order,
    setting: Setting,
  ): Promise<PaymentIntent> {
    const paymentIntent = paymentIntents.find(
      (intent: PaymentIntent) =>
        intent.tracking_number === order.tracking_number &&
        intent.payment_gateway.toString().toLowerCase() ===
          setting.options.paymentGateway.toString().toLowerCase(),
    );
    if (paymentIntent) {
      return paymentIntent;
    }
    
    const {
      id: payment_id,
      client_secret = null,
      redirect_url = null,
      customer = null,
    } = await this.savePaymentIntent(order, order.payment_gateway);
    
    const is_redirect = redirect_url ? true : false;
    const paymentIntentInfo: PaymentIntent = {
      id: Number(Date.now()),
      order_id: order.id,
      tracking_number: order.tracking_number,
      payment_gateway: order.payment_gateway.toString().toLowerCase(),
      payment_intent_info: {
        client_secret,
        payment_id,
        redirect_url,
        is_redirect,
      },
    };
  
    return paymentIntentInfo;
  }

  async savePaymentIntent(order: Order, paymentGateway?: string): Promise<any> {
    switch (order.payment_gateway) {
      case PaymentGatewayType.STRIPE:
        return {
          id: 'pi_' + Date.now(),
          client_secret: 'secret_' + Date.now(),
          redirect_url: null,
          customer: 'cus_' + Date.now(),
        };
      case PaymentGatewayType.PAYPAL:
        return {
          id: 'paypal_' + Date.now(),
          client_secret: null,
          redirect_url: `https://www.paypal.com/checkoutnow?token=${order.tracking_number}`,
          customer: null,
        };
      default:
        return null;
    }
  }

  async stripePay(order: Order): Promise<void> {
    const orderItem = this.orders.find((o) => o.id === order.id);
    if (orderItem) {
      orderItem.order_status = OrderStatusType.PROCESSING;
      orderItem.payment_status = PaymentStatusType.SUCCESS;
      orderItem.payment_intent = null; 
    }
  }

  async paypalPay(order: Order): Promise<void> {
    const orderItem = this.orders.find((o) => o.id === order.id);
    if (orderItem) {
      orderItem.order_status = OrderStatusType.PROCESSING;
      orderItem.payment_status = PaymentStatusType.SUCCESS;
      orderItem.payment_intent = null;
    }
  }

  changeOrderPaymentStatus(
    orderStatus: OrderStatusType,
    paymentStatus: PaymentStatusType,
  ): void {
    if (this.orders[0]) {
      this.orders[0].order_status = orderStatus;
      this.orders[0].payment_status = paymentStatus;
    }
  }
}