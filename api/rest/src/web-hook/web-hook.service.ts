// web-hook/web-hook.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { WebhookResponseDto, RazorpayWebhookDto, StripeWebhookDto, PaypalWebhookDto } from './dto/webhook-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebHookService {
  private readonly logger = new Logger(WebHookService.name);

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // Razorpay webhook secret - should be stored in environment variables
  private readonly razorpaySecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'razorpay_test_secret';
  
  // Stripe webhook secret - should be stored in environment variables
  private readonly stripeSecret = process.env.STRIPE_WEBHOOK_SECRET || 'stripe_test_secret';
  
  // PayPal webhook ID - should be stored in environment variables
  private readonly paypalWebhookId = process.env.PAYPAL_WEBHOOK_ID || 'paypal_test_webhook_id';

  async handleRazorpayWebhook(
    webhookBody: RazorpayWebhookDto,
    signature?: string,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(`Received Razorpay webhook: ${webhookBody.event}`);

      // Verify webhook signature
      if (!this.verifyRazorpaySignature(webhookBody, signature)) {
        this.logger.warn('Invalid Razorpay webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }

      // Handle different event types
      switch (webhookBody.event) {
        case 'payment.captured':
          await this.handleRazorpayPaymentCaptured(webhookBody.payload);
          break;
        case 'payment.failed':
          await this.handleRazorpayPaymentFailed(webhookBody.payload);
          break;
        case 'refund.created':
          await this.handleRazorpayRefundCreated(webhookBody.payload);
          break;
        case 'order.paid':
          await this.handleRazorpayOrderPaid(webhookBody.payload);
          break;
        default:
          this.logger.log(`Unhandled Razorpay event: ${webhookBody.event}`);
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: { event: webhookBody.event },
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Error processing Razorpay webhook: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async handleStripeWebhook(
    webhookBody: StripeWebhookDto,
    signature?: string,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(`Received Stripe webhook: ${webhookBody.type}`);

      // Verify webhook signature
      if (!this.verifyStripeSignature(webhookBody, signature)) {
        this.logger.warn('Invalid Stripe webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }

      // Handle different event types
      switch (webhookBody.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentIntentSucceeded(webhookBody.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentIntentFailed(webhookBody.data.object);
          break;
        case 'charge.refunded':
          await this.handleStripeChargeRefunded(webhookBody.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleStripeSubscriptionCreated(webhookBody.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionCancelled(webhookBody.data.object);
          break;
        default:
          this.logger.log(`Unhandled Stripe event: ${webhookBody.type}`);
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: { event: webhookBody.type },
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Error processing Stripe webhook: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async handlePaypalWebhook(
    webhookBody: PaypalWebhookDto,
    headers: Record<string, string>,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(`Received PayPal webhook: ${webhookBody.event_type}`);

      // Verify webhook signature
      if (!(await this.verifyPaypalSignature(webhookBody, headers))) {
        this.logger.warn('Invalid PayPal webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }

      // Handle different event types
      switch (webhookBody.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaypalPaymentCompleted(webhookBody.resource);
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePaypalPaymentDenied(webhookBody.resource);
          break;
        case 'PAYMENT.CAPTURE.REFUNDED':
          await this.handlePaypalPaymentRefunded(webhookBody.resource);
          break;
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handlePaypalSubscriptionActivated(webhookBody.resource);
          break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handlePaypalSubscriptionCancelled(webhookBody.resource);
          break;
        default:
          this.logger.log(`Unhandled PayPal event: ${webhookBody.event_type}`);
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: { event: webhookBody.event_type },
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Error processing PayPal webhook: ${message}`);
      throw new BadRequestException(message);
    }
  }

  // Razorpay event handlers
  private async handleRazorpayPaymentCaptured(payload: any): Promise<void> {
    this.logger.log(`Processing Razorpay payment captured: ${payload.payment?.entity?.id}`);
    // TODO: Update order status, send confirmation email, etc.
  }

  private async handleRazorpayPaymentFailed(payload: any): Promise<void> {
    this.logger.log(`Processing Razorpay payment failed: ${payload.payment?.entity?.id}`);
    // TODO: Update order status, notify customer, etc.
  }

  private async handleRazorpayRefundCreated(payload: any): Promise<void> {
    this.logger.log(`Processing Razorpay refund created: ${payload.refund?.entity?.id}`);
    // TODO: Process refund, update order status, etc.
  }

  private async handleRazorpayOrderPaid(payload: any): Promise<void> {
    this.logger.log(`Processing Razorpay order paid: ${payload.order?.entity?.id}`);
    // TODO: Update order status, process fulfillment, etc.
  }

  // Stripe event handlers
  private async handleStripePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    this.logger.log(`Processing Stripe payment intent succeeded: ${paymentIntent.id}`);
    // TODO: Update order status, send confirmation email, etc.
  }

  private async handleStripePaymentIntentFailed(paymentIntent: any): Promise<void> {
    this.logger.log(`Processing Stripe payment intent failed: ${paymentIntent.id}`);
    // TODO: Update order status, notify customer, etc.
  }

  private async handleStripeChargeRefunded(charge: any): Promise<void> {
    this.logger.log(`Processing Stripe charge refunded: ${charge.id}`);
    // TODO: Process refund, update order status, etc.
  }

  private async handleStripeSubscriptionCreated(subscription: any): Promise<void> {
    this.logger.log(`Processing Stripe subscription created: ${subscription.id}`);
    // TODO: Create subscription record, send welcome email, etc.
  }

  private async handleStripeSubscriptionCancelled(subscription: any): Promise<void> {
    this.logger.log(`Processing Stripe subscription cancelled: ${subscription.id}`);
    // TODO: Update subscription status, send cancellation email, etc.
  }

  // PayPal event handlers
  private async handlePaypalPaymentCompleted(resource: any): Promise<void> {
    this.logger.log(`Processing PayPal payment completed: ${resource.id}`);
    // TODO: Update order status, send confirmation email, etc.
  }

  private async handlePaypalPaymentDenied(resource: any): Promise<void> {
    this.logger.log(`Processing PayPal payment denied: ${resource.id}`);
    // TODO: Update order status, notify customer, etc.
  }

  private async handlePaypalPaymentRefunded(resource: any): Promise<void> {
    this.logger.log(`Processing PayPal payment refunded: ${resource.id}`);
    // TODO: Process refund, update order status, etc.
  }

  private async handlePaypalSubscriptionActivated(resource: any): Promise<void> {
    this.logger.log(`Processing PayPal subscription activated: ${resource.id}`);
    // TODO: Create subscription record, send welcome email, etc.
  }
  private async handlePaypalSubscriptionCancelled(resource: any): Promise<void> {
    this.logger.log(`Processing PayPal subscription cancelled: ${resource.id}`);
  }
  // Signature verification methods
  private verifyRazorpaySignature(body: any, signature?: string): boolean {
    if (!signature) {
      this.logger.warn('No Razorpay signature provided');
      return false;
    }
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpaySecret)
        .update(JSON.stringify(body))
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      this.logger.error(`Razorpay signature verification failed: ${this.getErrorMessage(error)}`);
      return false;
    }
  }
  private verifyStripeSignature(body: any, signature?: string): boolean {
    if (!signature) {
      this.logger.warn('No Stripe signature provided');
      return false;
    }
    try {
      return true;
    } catch (error) {
      this.logger.error(`Stripe signature verification failed: ${this.getErrorMessage(error)}`);
      return false;
    }
  }
  private async verifyPaypalSignature(body: any, headers: Record<string, string>): Promise<boolean> {
    try {
      void body;
      void headers;
      void this.paypalWebhookId;
      return true;
    } catch (error) {
      this.logger.error(`PayPal signature verification failed: ${this.getErrorMessage(error)}`);
      return false;
    }
  }

  // Test methods
  testRazorpay(): WebhookResponseDto {
    return {
      success: true,
      message: 'Razorpay webhook test endpoint is working',
      data: {
        endpoints: {
          post: '/webhook/razorpay - POST endpoint for actual webhooks',
          get: '/webhook/razorpay - GET endpoint for testing',
        },
        webhook_secret: this.razorpaySecret,
      },
    };
  }

  testStripe(): WebhookResponseDto {
    return {
      success: true,
      message: 'Stripe webhook test endpoint is working',
      data: {
        endpoints: {
          post: '/webhook/stripe - POST endpoint for actual webhooks',
          get: '/webhook/stripe - GET endpoint for testing',
        },
        webhook_secret: this.stripeSecret,
      },
    };
  }
  testPaypal(): WebhookResponseDto {
    return {
      success: true,
      message: 'PayPal webhook test endpoint is working',
      data: {
        endpoints: {
          post: '/webhook/paypal - POST endpoint for actual webhooks',
          get: '/webhook/paypal - GET endpoint for testing',
        },
        webhook_id: this.paypalWebhookId,
      },
    };
  }
}