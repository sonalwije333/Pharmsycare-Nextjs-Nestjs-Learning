import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PayPalPayment,
  PayPalPaymentStatus,
  PayPalPaymentIntent,
  PayPalRefund,
} from '../../../payment/entities/paypal.entity';
import {
  StripePayment,
  StripePaymentStatus,
  StripePaymentMethodType,
  StripeCustomer,
  StripeRefund,
} from '../../../payment/entities/stripe.entity';
import { User } from '../../../users/entities/user.entity';
import * as paymentIntentData from '../../../db/pickbazar/payment-intent.json';
import * as paymentMethodData from '../../../db/pickbazar/payment-methods.json';

@Injectable()
export class PaymentSeederService {
  private readonly logger = new Logger(PaymentSeederService.name);

  constructor(
    @InjectRepository(PayPalPayment)
    private paypalPaymentRepository: Repository<PayPalPayment>,
    @InjectRepository(PayPalRefund)
    private paypalRefundRepository: Repository<PayPalRefund>,
    @InjectRepository(StripePayment)
    private stripePaymentRepository: Repository<StripePayment>,
    @InjectRepository(StripeCustomer)
    private stripeCustomerRepository: Repository<StripeCustomer>,
    @InjectRepository(StripeRefund)
    private stripeRefundRepository: Repository<StripeRefund>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    this.logger.log('🌱 Seeding payment data...');

    try {
      // Seed Stripe customers
      await this.seedStripeCustomers();
      
      // Seed Stripe payments
      await this.seedStripePayments();
      
      // Seed PayPal payments
      await this.seedPayPalPayments();
      
      // Seed refunds
      await this.seedRefunds();
      
      this.logger.log('✅ Payment data seeded successfully');
    } catch (error) {
      this.logger.error(`❌ Failed to seed payment data: ${error.message}`);
      throw error;
    }
  }

  async seedStripeCustomers() {
    const stripeCustomers = paymentMethodData.stripe_customers;
    
    for (const customerData of stripeCustomers) {
      const exists = await this.stripeCustomerRepository.findOne({
        where: { stripe_customer_id: customerData.stripe_customer_id },
      });
      
      if (!exists) {
        const resolvedUserId = await this.resolveUserId(customerData.user_id, customerData.email);
        if (!resolvedUserId) {
          this.logger.warn(`Skipping Stripe customer ${customerData.stripe_customer_id}: no matching user found`);
          continue;
        }

        const customer = this.stripeCustomerRepository.create({
          ...customerData,
          user_id: resolvedUserId,
        });
        await this.stripeCustomerRepository.save(customer);
        this.logger.debug(`Seeded Stripe customer: ${customerData.email}`);
      }
    }
  }

  async seedStripePayments() {
    const stripePayments = paymentIntentData.payment_intents.filter(
      p => p.payment_gateway === 'STRIPE'
    );
    
    for (const paymentData of stripePayments) {
      const exists = await this.stripePaymentRepository.findOne({
        where: { stripe_payment_intent_id: paymentData.gateway_payment_id },
      });
      
      if (!exists) {
        const resolvedUserId = await this.resolveUserId(
          paymentData.user_id,
          paymentData.metadata?.customer_email,
        );
        if (!resolvedUserId) {
          this.logger.warn(`Skipping Stripe payment ${paymentData.gateway_payment_id}: no matching user found`);
          continue;
        }

        const payment = this.stripePaymentRepository.create({
          stripe_payment_intent_id: paymentData.gateway_payment_id,
          stripe_customer_id: paymentData.gateway_customer_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: this.mapStripeStatus(paymentData.status),
          payment_method_type: paymentData.payment_method_type as StripePaymentMethodType,
          payment_method_id: paymentData.payment_method_id,
          client_secret: paymentData.client_secret,
          user_id: resolvedUserId,
          description: `Payment for order ${paymentData.tracking_number}`,
          receipt_url: paymentData.succeeded_at ? `https://dashboard.stripe.com/invoices/${paymentData.gateway_payment_id}` : null,
          charge_id: paymentData.succeeded_at ? `ch_${paymentData.gateway_payment_id.substring(3)}` : null,
          succeeded_at: paymentData.succeeded_at ? new Date(paymentData.succeeded_at) : null,
          created_at: new Date(paymentData.created_at),
          updated_at: new Date(paymentData.updated_at),
          payment_method_details: paymentData.metadata,
        });
        
        await this.stripePaymentRepository.save(payment);
        this.logger.debug(`Seeded Stripe payment: ${paymentData.gateway_payment_id}`);
      }
    }
  }

  async seedPayPalPayments() {
    const paypalPayments = paymentIntentData.payment_intents.filter(
      p => p.payment_gateway === 'PAYPAL'
    );
    
    for (const paymentData of paypalPayments) {
      const exists = await this.paypalPaymentRepository.findOne({
        where: { paypal_order_id: paymentData.gateway_payment_id },
      });
      
      if (!exists) {
        const resolvedUserId = await this.resolveUserId(paymentData.user_id);
        if (!resolvedUserId) {
          this.logger.warn(`Skipping PayPal payment ${paymentData.gateway_payment_id}: no matching user found`);
          continue;
        }

        const payment = this.paypalPaymentRepository.create({
          paypal_order_id: paymentData.gateway_payment_id,
          invoice_id: paymentData.tracking_number.toString(),
          amount: paymentData.amount / 100, // Convert from cents to dollars if needed
          currency_code: paymentData.currency,
          description: `Payment for order ${paymentData.tracking_number}`,
          status: this.mapPayPalStatus(paymentData.status),
          intent: PayPalPaymentIntent.CAPTURE,
          approval_url: paymentData.redirect_url,
          cancel_url: paymentData.cancel_url,
          return_url: paymentData.return_url,
          user_id: resolvedUserId,
          links: [],
          completed_at: paymentData.succeeded_at ? new Date(paymentData.succeeded_at) : null,
          created_at: new Date(paymentData.created_at),
          updated_at: new Date(paymentData.updated_at),
        });
        
        await this.paypalPaymentRepository.save(payment);
        this.logger.debug(`Seeded PayPal payment: ${paymentData.gateway_payment_id}`);
      }
    }
  }

  async seedRefunds() {
    // Create refunds for refunded payments
    const refundedStripePayment = paymentIntentData.payment_intents.find(
      p => p.status === 'refunded' && p.payment_gateway === 'STRIPE'
    );
    
    if (refundedStripePayment) {
      const stripePayment = await this.stripePaymentRepository.findOne({
        where: { stripe_payment_intent_id: refundedStripePayment.gateway_payment_id },
      });
      
      if (stripePayment && !stripePayment.refund_id) {
        const refund = this.stripeRefundRepository.create({
          stripe_refund_id: `re_${refundedStripePayment.gateway_payment_id.substring(3)}`,
          stripe_payment_id: stripePayment.id,
          amount: refundedStripePayment.amount,
          reason: 'requested_by_customer',
          status: 'succeeded',
          created_at: new Date(refundedStripePayment.updated_at),
          updated_at: new Date(refundedStripePayment.updated_at),
        });
        
        await this.stripeRefundRepository.save(refund);
        
        // Update payment with refund info
        stripePayment.refund_id = refund.stripe_refund_id;
        stripePayment.refund_amount = refundedStripePayment.amount;
        stripePayment.refund_reason = 'requested_by_customer';
        stripePayment.refunded_at = new Date(refundedStripePayment.updated_at);
        stripePayment.status = StripePaymentStatus.REFUNDED;
        await this.stripePaymentRepository.save(stripePayment);
        
        this.logger.debug(`Seeded refund for Stripe payment: ${refundedStripePayment.gateway_payment_id}`);
      }
    }
  }

  async clear() {
    this.logger.log('🗑️ Clearing payment data...');
    
    try {
      await this.stripeRefundRepository.delete({});
      await this.paypalRefundRepository.delete({});
      await this.stripePaymentRepository.delete({});
      await this.paypalPaymentRepository.delete({});
      await this.stripeCustomerRepository.delete({});
      
      this.logger.log('✅ Payment data cleared successfully');
    } catch (error) {
      this.logger.error(`❌ Failed to clear payment data: ${error.message}`);
      throw error;
    }
  }

  async seedSpecific(type: string) {
    this.logger.log(`🌱 Seeding specific payment data: ${type}`);
    
    switch (type) {
      case 'stripe-customers':
        await this.seedStripeCustomers();
        break;
      case 'stripe-payments':
        await this.seedStripePayments();
        break;
      case 'paypal-payments':
        await this.seedPayPalPayments();
        break;
      case 'refunds':
        await this.seedRefunds();
        break;
      default:
        await this.seed();
    }
  }

  private mapStripeStatus(status: string): StripePaymentStatus {
    const statusMap: Record<string, StripePaymentStatus> = {
      'succeeded': StripePaymentStatus.SUCCEEDED,
      'requires_payment_method': StripePaymentStatus.REQUIRES_PAYMENT_METHOD,
      'requires_confirmation': StripePaymentStatus.REQUIRES_CONFIRMATION,
      'requires_action': StripePaymentStatus.REQUIRES_ACTION,
      'processing': StripePaymentStatus.PROCESSING,
      'canceled': StripePaymentStatus.CANCELED,
      'refunded': StripePaymentStatus.REFUNDED,
    };
    return statusMap[status] || StripePaymentStatus.REQUIRES_PAYMENT_METHOD;
  }

  private mapPayPalStatus(status: string): PayPalPaymentStatus {
    const statusMap: Record<string, PayPalPaymentStatus> = {
      'COMPLETED': PayPalPaymentStatus.COMPLETED,
      'CREATED': PayPalPaymentStatus.CREATED,
      'APPROVED': PayPalPaymentStatus.APPROVED,
      'FAILED': PayPalPaymentStatus.FAILED,
      'CANCELLED': PayPalPaymentStatus.CANCELLED,
      'REFUNDED': PayPalPaymentStatus.REFUNDED,
    };
    return statusMap[status] || PayPalPaymentStatus.CREATED;
  }

  private async resolveUserId(preferredId?: number, email?: string): Promise<number | null> {
    if (preferredId) {
      const userById = await this.userRepository.findOne({
        where: { id: preferredId },
        select: ['id'],
      });
      if (userById) {
        return userById.id;
      }
    }

    if (email) {
      const userByEmail = await this.userRepository.findOne({
        where: { email },
        select: ['id'],
      });
      if (userByEmail) {
        return userByEmail.id;
      }
    }

    const [fallbackUser] = await this.userRepository.find({
      order: { id: 'ASC' },
      select: ['id'],
      take: 1,
    });

    return fallbackUser?.id ?? null;
  }
}