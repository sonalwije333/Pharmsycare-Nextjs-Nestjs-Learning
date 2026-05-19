import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { CardElementDto, CreatePaymentIntentDto, StripeCreateCustomerDto } from './dto/stripe.dto';
import { StripePayment, StripeCustomer } from './entities/stripe.entity';
import { StripePaymentStatus } from 'src/common/enums/payment.enum';


@Injectable()
export class StripePaymentService {
  private readonly logger = new Logger(StripePaymentService.name);

  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @InjectRepository(StripePayment)
    private stripePaymentRepository: Repository<StripePayment>,
    @InjectRepository(StripeCustomer)
    private stripeCustomerRepository: Repository<StripeCustomer>,
  ) {}

  async createCustomer(createCustomerDto?: StripeCreateCustomerDto): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripeClient.customers.create(createCustomerDto);
      
      // Save to database
      const stripeCustomer = this.stripeCustomerRepository.create({
        stripe_customer_id: customer.id,
        user_id: 0, // Should be set from auth
        email: customer.email || '',
        name: customer.name || '',
        metadata: customer.metadata,
      });
      await this.stripeCustomerRepository.save(stripeCustomer);
      
      return customer;
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

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentPayload: Stripe.PaymentIntentCreateParams = {
        amount: createPaymentIntentDto.amount,
        currency: createPaymentIntentDto.currency ?? 'usd',
      };
      const paymentIntent = await this.stripeClient.paymentIntents.create(paymentIntentPayload);
      
      // Save to database
      const stripePayment = this.stripePaymentRepository.create({
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as StripePaymentStatus,
        client_secret: paymentIntent.client_secret,
        user_id: 0, // Should be set from auth
      });
      await this.stripePaymentRepository.save(stripePayment);
      
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw error;
    }
  }

  async retrievePaymentIntent(payment_id: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.retrieve(payment_id);
      
      // Update local record
      await this.stripePaymentRepository.update(
        { stripe_payment_intent_id: payment_id },
        { status: paymentIntent.status as StripePaymentStatus }
      );
      
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`);
      throw error;
    }
  }

  async getPaymentByIntentId(intentId: string): Promise<StripePayment> {
    const payment = await this.stripePaymentRepository.findOne({
      where: { stripe_payment_intent_id: intentId },
    });
    
    if (!payment) {
      throw new NotFoundException(`Stripe payment with intent ID ${intentId} not found`);
    }
    
    return payment;
  }

  async getPaymentsByUser(userId: number): Promise<StripePayment[]> {
    return this.stripePaymentRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}