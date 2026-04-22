// payment/paypal-payment.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as Paypal from '@paypal/checkout-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { PaypalOrderResponse } from './dto/paypal.dto';

@Injectable()
export class PaypalPaymentService {
  private readonly logger = new Logger(PaypalPaymentService.name);
  private clientId: string;
  private clientSecret: string;
  private environment: any;
  private client: any;
  private paypal: any;

  constructor() {
    this.paypal = Paypal;
    this.clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
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
      return {
        redirect_url: links[1].href,
        id: id,
      };
    } catch (error) {
      this.logger.error(`Failed to create PayPal payment intent: ${error.message}`);
      throw error;
    }
  }

  async verifyOrder(orderId: string | number): Promise<{ id: string; status: string }> {
    try {
      const request = new this.paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      const response = await this.client.execute(request);
      return {
        id: response.result.id,
        status: response.result.status,
      };
    } catch (error) {
      this.logger.error(`Failed to verify PayPal order: ${error.message}`);
      throw error;
    }
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