import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {CardElementDto, CreatePaymentIntentDto, StripeCreateCustomerDto} from "./dto/stripe.dto";
import StripeMetadata, {
  PaymentIntentMetadata,
  StripeCard,
  StripeCustomer,
  StripeCustomerList,
  StripePaymentIntent,
  StripePaymentMethod
} from "./entity/stripe.entity";
import {Order} from "../orders/entities/order.entity";
import {User} from "../users/entities/user.entity";

@Injectable()
export class StripePaymentService {
  private stripeClient: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripeClient = new Stripe(stripeSecretKey, {
      // apiVersion: '2023-10-16',
    });
  }

  async createCustomer(
    createCustomerDto?: StripeCreateCustomerDto,
  ): Promise<StripeCustomer> {
    try {
      const customer = await this.stripeClient.customers.create(createCustomerDto);
      return this.mapStripeCustomer(customer);
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async retrieveCustomer(id: string): Promise<StripeCustomer> {
    try {
      const customer = await this.stripeClient.customers.retrieve(id);
      if (customer.deleted) {
        throw new Error(`Customer ${id} has been deleted`);
      }
      return this.mapStripeCustomer(customer);
    } catch (error) {
      throw new Error(`Failed to retrieve customer: ${error.message}`);
    }
  }

  async listAllCustomers(): Promise<StripeCustomerList> {
    try {
      const customerList = await this.stripeClient.customers.list();
      return {
        object: customerList.object,
        url: customerList.url,
        has_more: customerList.has_more,
        data: customerList.data.map(customer => this.mapStripeCustomer(customer)),
      };
    } catch (error) {
      throw new Error(`Failed to list customers: ${error.message}`);
    }
  }

  async createPaymentMethod(
    cardElementDto: CardElementDto,
  ): Promise<StripePaymentMethod> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.create({
        type: 'card',
        card: cardElementDto,
      });
      return this.mapStripePaymentMethod(paymentMethod);
    } catch (error) {
      throw new Error(`Failed to create payment method: ${error.message}`);
    }
  }

  async retrievePaymentMethod(
    method_key: string,
  ): Promise<StripePaymentMethod> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.retrieve(method_key);
      return this.mapStripePaymentMethod(paymentMethod);
    } catch (error) {
      throw new Error(`Failed to retrieve payment method: ${error.message}`);
    }
  }

  async retrievePaymentMethodsByCustomerId(
    customerId: string,
  ): Promise<StripePaymentMethod[]> {
    try {
      const { data } = await this.stripeClient.customers.listPaymentMethods(
        customerId,
        { type: 'card' },
      );
      return data.map(pm => this.mapStripePaymentMethod(pm));
    } catch (error) {
      throw new Error(`Failed to retrieve customer payment methods: ${error.message}`);
    }
  }

  async attachPaymentMethodToCustomer(
    method_id: string,
    customer_id: string,
  ): Promise<StripePaymentMethod> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.attach(method_id, {
        customer: customer_id,
      });
      return this.mapStripePaymentMethod(paymentMethod);
    } catch (error) {
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }

  async detachPaymentMethodFromCustomer(
    method_id: string,
  ): Promise<StripePaymentMethod> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.detach(method_id);
      return this.mapStripePaymentMethod(paymentMethod);
    } catch (error) {
      throw new Error(`Failed to detach payment method: ${error.message}`);
    }
  }

  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.create(
        createPaymentIntentDto,
      );
      return this.mapStripePaymentIntent(paymentIntent);
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async retrievePaymentIntent(
    payment_id: string,
  ): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.retrieve(payment_id);
      return this.mapStripePaymentIntent(paymentIntent);
    } catch (error) {
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  async makePaymentIntentParams(order: Order, user: User): Promise<any> {
    try {
      const customerList = await this.listAllCustomers();
      let currentCustomer = customerList.data?.find(
        (customer: StripeCustomer) => customer.email === user.email,
      );

      if (!currentCustomer) {
        const newCustomer = await this.createCustomer({
          name: user.name,
          email: user.email,
        });
        currentCustomer = newCustomer;
      }

      return {
        customer: currentCustomer.id,
        amount: Math.ceil(order.paid_total * 100), // Convert to cents
        currency: process.env.DEFAULT_CURRENCY || 'usd',
        payment_method_types: ['card'],
        metadata: {
          order_tracking_number: order.tracking_number,
        },
      };
    } catch (error) {
      throw new Error(`Failed to create payment intent params: ${error.message}`);
    }
  }

  // Helper methods to map Stripe SDK responses to our entity types
  private mapStripeCustomer(customer: Stripe.Customer): StripeCustomer {
    return {
      id: customer.id,
      object: customer.object,
      address: customer.address,
      balance: customer.balance,
      created: customer.created,
      currency: customer.currency ?? undefined,
      default_source: typeof customer.default_source === 'string' ? customer.default_source : null,
      delinquent: customer.delinquent ?? undefined,
      description: customer.description,
      discount: customer.discount,
      email: customer.email,
      // invoice_prefix: customer.invoice_prefix,
      // invoice_settings: customer.invoice_settings,
      livemode: customer.livemode,
      metadata: customer.metadata as StripeMetadata,
      name: customer.name,
      next_invoice_sequence: customer.next_invoice_sequence,
      phone: customer.phone,
      // preferred_locales: customer.preferred_locales,
      shipping: customer.shipping,
      // tax_exempt: customer.tax_exempt,
      // test_clock: customer.test_clock ?? null,
    };
  }

  private mapStripePaymentMethod(paymentMethod: Stripe.PaymentMethod): StripePaymentMethod {
    return {
      id: paymentMethod.id,
      object: paymentMethod.object,
      billing_details: paymentMethod.billing_details,
      card: paymentMethod.card as StripeCard,
      created: paymentMethod.created,
      customer: paymentMethod.customer as string,
      livemode: paymentMethod.livemode,
      metadata: paymentMethod.metadata as StripeMetadata,
      type: paymentMethod.type,
    };
  }

  private mapStripePaymentIntent(paymentIntent: Stripe.PaymentIntent): StripePaymentIntent {
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      amount_received: paymentIntent.amount_received,
      client_secret: paymentIntent.client_secret,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer as string,
      metadata: paymentIntent.metadata as PaymentIntentMetadata,
      payment_method_types: paymentIntent.payment_method_types,
      setup_future_usage: paymentIntent.setup_future_usage,
      status: paymentIntent.status,
    };
  }
}