import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {Order} from "../orders/entities/order.entity";

@Injectable()
export class PaypalPaymentService {
  private clientId: string;
  private clientSecret: string;
  private environment: any;
  private client: any;
  private paypal: any;

  constructor() {

    // this.clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
    // this.clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

    this.environment = new this.paypal.core.SandboxEnvironment(
      this.clientId,
      this.clientSecret,
    );
    this.client = new this.paypal.core.PayPalHttpClient(this.environment);
  }

  async createPaymentIntent(order: Order): Promise<{ redirect_url: string; id: string }> {
    try {
      const request = new this.paypal.orders.OrdersCreateRequest();
      request.headers = {
        ...request.headers,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': uuidv4(),
      };

      const body = this.getRequestBody(order);
      request.requestBody(body);

      const response = await this.client.execute(request);
      const { links, id } = response.result;

      return {
        redirect_url: links[1].href,
        id: id,
      };
    } catch (error) {
      throw new Error(`Failed to create PayPal payment intent: ${error.message}`);
    }
  }

  async verifyOrder(orderId: string): Promise<{ id: string; status: string }> {
    try {
      const request = new this.paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await this.client.execute(request);
      return {
        id: response.result.id,
        status: response.result.status,
      };
    } catch (error) {
      throw new Error(`Failed to verify PayPal order: ${error.message}`);
    }
  }

  private getRequestBody(order: Order): any {
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
            value: order.paid_total.toString(),
          },
          description: `Order #${order.tracking_number}`,
          reference_id: order.tracking_number.toString(),
        },
      ],
    };
  }

  async getAccessToken(): Promise<string> {
    try {
      const request = new this.paypal.core.AccessTokenRequest(
        this.environment,
        this.clientId,
        this.clientSecret
      );

      const response = await this.client.execute(request);
      return response.result.access_token;
    } catch (error) {
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  }
}