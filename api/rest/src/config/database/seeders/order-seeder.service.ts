// src/config/database/seeders/order-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderFiles } from '../../../orders/entities/order.entity';
import { OrderStatus } from '../../../orders/entities/order-status.entity';
import ordersJson from '@db/orders.json';
import orderStatusJson from '@db/order-statuses.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import orderExportJson from '@db/order-export.json';

@Injectable()
export class OrderSeederService {
  private readonly logger = new Logger(OrderSeederService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(OrderFiles)
    private orderFilesRepository: Repository<OrderFiles>,
  ) {}

  async seed() {
    try {
      this.logger.log('📦 Starting order seeding...');

      // Check if orders already exist
      const orderCount = await this.orderRepository.count();
      if (orderCount > 0) {
        this.logger.log(
          `📊 Found ${orderCount} existing orders, skipping seed`,
        );
        return;
      }

      // Seed order statuses first
      await this.seedOrderStatuses();

      // Map and seed orders
      const orders = ordersJson.map((item) => {
        const order = new Order();

        order.id = item.id;
        order.tracking_number = item.tracking_number;
        order.customer_id = item.customer_id;
        order.customer_contact = item.customer_contact;
        order.amount = item.amount;
        order.sales_tax = item.sales_tax;
        order.paid_total = item.paid_total;
        order.total = item.total;
        order.language = item.language || 'en';
        order.discount = item.discount || 0;
        // order.payment_gateway = item.payment_gateway;
        order.altered_payment_gateway = item.altered_payment_gateway;
        order.delivery_fee = item.delivery_fee || 0;
        order.delivery_time = item.delivery_time;
        // order.order_status = item.order_status;
        // order.payment_status = item.payment_status;
        order.created_at = new Date(item.created_at);
        order.updated_at = new Date(item.created_at);

        // Handle parent-child relationships
        if (item.parent_id) {
          order.parent_order = { id: item.parent_id } as Order;
        }

        // Handle addresses as JSON (only if not empty array)
        if (
          item.shipping_address &&
          !Array.isArray(item.shipping_address) &&
          Object.keys(item.shipping_address).length > 0
        ) {
          // order.shipping_address = item.shipping_address;
        }
        if (
          item.billing_address &&
          !Array.isArray(item.billing_address) &&
          Object.keys(item.billing_address).length > 0
        ) {
          // order.billing_address = item.billing_address;
        }

        return order;
      });

      const savedOrders = await this.orderRepository.save(orders);
      this.logger.log(`✅ Successfully seeded ${savedOrders.length} orders`);

      // Seed order files
      await this.seedOrderFiles();

      // Log order details
      savedOrders.forEach((order) => {
        this.logger.debug(
          `   - Order #${order.id}: ${order.tracking_number} - ${order.order_status}`,
        );
      });

      return savedOrders;
    } catch (error) {
      this.logger.error(`❌ Failed to seed orders: ${error.message}`);
      throw error;
    }
  }

  private async seedOrderStatuses() {
    const statusCount = await this.orderStatusRepository.count();
    if (statusCount > 0) {
      this.logger.log(
        `📊 Found ${statusCount} existing order statuses, skipping seed`,
      );
      return;
    }

    const statuses = orderStatusJson.map((item) => {
      const status = new OrderStatus();

      status.id = item.id;
      status.name = item.name;
      status.slug = item.slug;
      status.serial = item.serial;
      status.color = item.color;
      status.language = item.language;
      status.translated_languages = item.translated_languages;
      status.created_at = new Date(item.created_at);
      status.updated_at = new Date(item.updated_at);

      return status;
    });

    const savedStatuses = await this.orderStatusRepository.save(statuses);
    this.logger.log(
      `✅ Successfully seeded ${savedStatuses.length} order statuses`,
    );

    savedStatuses.forEach((status) => {
      this.logger.debug(`   - ${status.name} (${status.slug})`);
    });
  }

  private async seedOrderFiles() {
    const filesCount = await this.orderFilesRepository.count();
    if (filesCount > 0) {
      this.logger.log(
        `📊 Found ${filesCount} existing order files, skipping seed`,
      );
      return;
    }

    const files = orderFilesJson.map((item) => {
      const file = new OrderFiles();

      file.id = item.id;
      file.purchase_key = item.purchase_key;
      file.digital_file_id = item.digital_file_id;
      file.order_id = item.order_id;
      file.customer_id = item.customer_id;
      file.created_at = new Date(item.created_at);
      file.updated_at = new Date(item.updated_at);

      return file;
    });

    const savedFiles = await this.orderFilesRepository.save(files);
    this.logger.log(`✅ Successfully seeded ${savedFiles.length} order files`);
  }

  async clear() {
    try {
      this.logger.log('🗑️ Clearing orders...');

      // Delete in correct order to avoid foreign key constraints
      await this.orderFilesRepository.delete({});
      await this.orderRepository.delete({});
      await this.orderStatusRepository.delete({});

      this.logger.log(`✅ Cleared orders, order files, and order statuses`);
    } catch (error) {
      this.logger.error(`❌ Failed to clear orders: ${error.message}`);
      throw error;
    }
  }

  async seedSpecific(type: string) {
    switch (type) {
      case 'statuses':
        await this.seedOrderStatuses();
        break;
      case 'files':
        await this.seedOrderFiles();
        break;
      case 'orders':
        await this.seed();
        break;
      default:
        await this.seed();
        break;
    }
  }

  async seedByCustomerId(customerId: number) {
    const filteredOrders = ordersJson.filter(
      (item) => item.customer_id === customerId,
    );

    const orders = filteredOrders.map((item) => {
      const order = new Order();

      order.id = item.id;
      order.tracking_number = item.tracking_number;
      order.customer_id = item.customer_id;
      order.customer_contact = item.customer_contact;
      order.amount = item.amount;
      order.sales_tax = item.sales_tax;
      order.paid_total = item.paid_total;
      order.total = item.total;
      order.language = item.language || 'en';
      order.discount = item.discount || 0;
      // order.payment_gateway = item.payment_gateway;
      order.delivery_fee = item.delivery_fee || 0;
      order.delivery_time = item.delivery_time;
      // order.order_status = item.order_status;
      // order.payment_status = item.payment_status;
      order.created_at = new Date(item.created_at);
      order.updated_at = new Date(item.created_at);

      if (item.parent_id) {
        order.parent_order = { id: item.parent_id } as Order;
      }

      if (
        item.shipping_address &&
        !Array.isArray(item.shipping_address) &&
        Object.keys(item.shipping_address).length > 0
      ) {
        // order.shipping_address = item.shipping_address;
      }
      if (
        item.billing_address &&
        !Array.isArray(item.billing_address) &&
        Object.keys(item.billing_address).length > 0
      ) {
        // order.billing_address = item.billing_address;
      }

      return order;
    });

    const saved = await this.orderRepository.save(orders);
    this.logger.log(
      `✅ Seeded ${saved.length} orders for customer ${customerId}`,
    );
    return saved;
  }

  async seedByOrderStatus(statusSlug: string) {
    const filteredOrders = ordersJson.filter(
      (item) => item.order_status === statusSlug,
    );

    const orders = filteredOrders.map((item) => {
      const order = new Order();

      order.id = item.id;
      order.tracking_number = item.tracking_number;
      order.customer_id = item.customer_id;
      order.customer_contact = item.customer_contact;
      order.amount = item.amount;
      order.sales_tax = item.sales_tax;
      order.paid_total = item.paid_total;
      order.total = item.total;
      order.language = item.language || 'en';
      order.discount = item.discount || 0;
      // order.payment_gateway = item.payment_gateway;
      order.delivery_fee = item.delivery_fee || 0;
      order.delivery_time = item.delivery_time;
      // order.order_status = item.order_status;
      // order.payment_status = item.payment_status;
      order.created_at = new Date(item.created_at);
      order.updated_at = new Date(item.created_at);

      if (item.parent_id) {
        order.parent_order = { id: item.parent_id } as Order;
      }

      if (
        item.shipping_address &&
        !Array.isArray(item.shipping_address) &&
        Object.keys(item.shipping_address).length > 0
      ) {
        // order.shipping_address = item.shipping_address;
      }
      if (
        item.billing_address &&
        !Array.isArray(item.billing_address) &&
        Object.keys(item.billing_address).length > 0
      ) {
        // order.billing_address = item.billing_address;
      }

      return order;
    });

    const saved = await this.orderRepository.save(orders);
    this.logger.log(
      `✅ Seeded ${saved.length} orders with status ${statusSlug}`,
    );
    return saved;
  }
}
