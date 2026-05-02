// payment/stripe-payment.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import {
  CardElementDto,
  CreatePaymentIntentDto,
  StripeCreateCustomerDto,
} from './dto/stripe.dto';

@Injectable()
export class StripePaymentService {
  private readonly logger = new Logger(StripePaymentService.name);

  constructor(@InjectStripe() private readonly stripeClient: Stripe) {}

  @ApiOperation({ summary: 'Create Stripe customer' })
  async createCustomer(createCustomerDto?: StripeCreateCustomerDto): Promise<Stripe.Customer> {
    try {
      return await this.stripeClient.customers.create(createCustomerDto);
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }

  async retrieveCustomer(id: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    try {
      return await this.stripeClient.customers.retrieve(id);
    } catch (error) {
      this.logger.error(`Failed to retrieve customer: ${error.message}`);
      throw error;
    }
  }

  async listAllCustomer(): Promise<Stripe.ApiList<Stripe.Customer>> {
    try {
      return await this.stripeClient.customers.list();
    } catch (error) {
      this.logger.error(`Failed to list customers: ${error.message}`);
      throw error;
    }
  }

  async createPaymentMethod(cardElementDto: CardElementDto): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.create({
        type: 'card',
        card: cardElementDto,
      });
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to create payment method: ${error.message}`);
      throw error;
    }
  }

  async retrievePaymentMethod(method_key: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripeClient.paymentMethods.retrieve(method_key);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment method: ${error.message}`);
      throw error;
    }
  }

  async retrievePaymentMethodByCustomerId(customer: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const { data } = await this.stripeClient.customers.listPaymentMethods(customer, {
        type: 'card',
      });
      return data;
    } catch (error) {
      this.logger.error(`Failed to retrieve payment methods by customer: ${error.message}`);
      throw error;
    }
  }

  async attachPaymentMethodToCustomer(
    method_id: string,
    customer_id: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripeClient.paymentMethods.attach(method_id, {
        customer: customer_id,
      });
    } catch (error) {
      this.logger.error(`Failed to attach payment method: ${error.message}`);
      throw error;
    }
  }

  async detachPaymentMethodFromCustomer(method_id: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripeClient.paymentMethods.detach(method_id);
    } catch (error) {
      this.logger.error(`Failed to detach payment method: ${error.message}`);
      throw error;
    }
  }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentPayload: Stripe.PaymentIntentCreateParams = {
        ...createPaymentIntentDto,
        currency: createPaymentIntentDto.currency ?? 'usd',
      };
      const paymentIntent = await this.stripeClient.paymentIntents.create(paymentIntentPayload);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw error;
    }
  }

  async retrievePaymentIntent(payment_id: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripeClient.paymentIntents.retrieve(payment_id);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`);
      throw error;
    }
  }
}