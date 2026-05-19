import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Paypal from '@paypal/checkout-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { PayPalPayment } from './entities/paypal.entity';
import { PayPalPaymentIntent, PayPalPaymentStatus } from 'src/common/enums/payment.enum';


@Injectable()
export class PaypalPaymentService {
  private readonly logger = new Logger(PaypalPaymentService.name);
  private clientId: string;
  private clientSecret: string;
  private environment: any;
  private client: any;
  private paypal: any;

  constructor(
    @InjectRepository(PayPalPayment)
    private paypalPaymentRepository: Repository<PayPalPayment>,
  ) {
    this.paypal = Paypal;
    this.clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET || '';
    this.environment = new this.paypal.core.SandboxEnvironment(
      this.clientId,
      this.clientSecret,
    );
    this.client = new this.paypal.core.PayPalHttpClient(this.environment);
  }

  async createPaymentIntent(order: any): Promise<{ redirect_url: string; id: string }> {
    try {
      const request = new this.paypal.orders.OrdersCreateRequest();
      request.headers = {
        ...request.headers,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': uuidv4(),
      };
      request.requestBody(this.getRequestBody(order));
      const response = await this.client.execute(request);
      const { links, id } = response.result;
      
      // Save payment record
      const paymentRecord = this.paypalPaymentRepository.create({
        paypal_order_id: id,
        invoice_id: order.tracking_number?.toString() || Date.now().toString(),
        amount: order.paid_total || 56,
        currency_code: 'USD',
        description: order.description || 'Order From Marvel',
        intent: PayPalPaymentIntent.CAPTURE,
        status: PayPalPaymentStatus.CREATED,
        approval_url: links.find((link: any) => link.rel === 'approve')?.href,
        cancel_url: links.find((link: any) => link.rel === 'cancel')?.href,
        user_id: order.user_id || 1,
        links: links,
      });
      
      await this.paypalPaymentRepository.save(paymentRecord);
      
      return {
        redirect_url: links.find((link: any) => link.rel === 'approve')?.href,
        id: id,
      };
    } catch (error) {
      this.logger.error(`Failed to create PayPal payment intent: ${error.message}`);
      throw error;
    }
  }

  async verifyOrder(orderId: string): Promise<{ id: string; status: string }> {
    try {
      const request = new this.paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      const response = await this.client.execute(request);
      
      // Update payment record
      await this.paypalPaymentRepository.update(
        { paypal_order_id: orderId },
        {
          status: PayPalPaymentStatus.COMPLETED,
          completed_at: new Date(),
        }
      );
      
      return {
        id: response.result.id,
        status: response.result.status,
      };
    } catch (error) {
      this.logger.error(`Failed to verify PayPal order: ${error.message}`);
      throw error;
    }
  }

  async getPaymentByOrderId(paypalOrderId: string): Promise<PayPalPayment> {
    const payment = await this.paypalPaymentRepository.findOne({
      where: { paypal_order_id: paypalOrderId },
    });
    
    if (!payment) {
      throw new NotFoundException(`PayPal payment with order ID ${paypalOrderId} not found`);
    }
    
    return payment;
  }

  async getPaymentsByUser(userId: number): Promise<PayPalPayment[]> {
    return this.paypalPaymentRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  private getRequestBody(order: any) {
    const redirectUrl = process.env.SHOP_URL || 'http://localhost:3003';
    return {
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${redirectUrl}/orders/${order.tracking_number}/thank-you`,
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            cancel_url: `${redirectUrl}/orders/${order.tracking_number}/payment`,
            user_action: 'PAY_NOW',
          },
        },
      },
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: order.paid_total || 56,
          },
          description: 'Order From Marvel',
          reference_id: order.tracking_number?.toString(),
        },
      ],
    };
  }
}