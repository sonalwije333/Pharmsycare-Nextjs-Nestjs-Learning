import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntent } from './entities/payment-intent.entity';
import { PaymentGatewayType } from 'src/common/enums/order-payment.enum';
import { PaypalCreateIntentParam, PaypalOrderResponse } from '../payment/dto/create-payment-intent.dto';
import { PayPalPayment } from '../payment/entities/paypal.entity';
import { StripePayment } from '../payment/entities/stripe.entity';
import { PayPalPaymentStatus } from 'src/common/enums/payment.enum';


@Injectable()
export class PaymentIntentService {
  private readonly logger = new Logger(PaymentIntentService.name);

  constructor(
    @InjectRepository(PayPalPayment)
    private readonly paypalRepository: Repository<PayPalPayment>,
    @InjectRepository(StripePayment)
    private readonly stripeRepository: Repository<StripePayment>,
  ) {}

  async createPaymentIntent(body: PaypalCreateIntentParam): Promise<PaypalOrderResponse> {
    const orderId = `ORDER-${Date.now()}`;

    // Build response
    const response: PaypalOrderResponse = {
      id: orderId,
      status: 'CREATED',
      payment_source: body.payment_source,
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
          rel: 'approve',
          method: 'GET',
        },
      ],
    };

    try {
      // Persist a PayPal payment record for later reconciliation
      const purchaseUnit = body.purchase_units?.[0];
      const amount = purchaseUnit?.amount;

      const payPalRecordData: Partial<PayPalPayment> = {
        paypal_order_id: orderId,
        invoice_id: purchaseUnit?.invoice_id?.toString() ?? '',
        amount: amount ? Number(amount.value) : 0,
        currency_code: amount?.currency_code ?? 'USD',
        description: purchaseUnit?.description ?? null,
        status: PayPalPaymentStatus.CREATED,
        intent: (body.intent as any) ?? null,
        approval_url: response.links[0].href,
        cancel_url: body.payment_source?.paypal?.experience_context?.cancel_url ?? null,
        return_url: body.payment_source?.paypal?.experience_context?.return_url ?? null,
        payment_source: body.payment_source ?? null,
        links: response.links ?? null,
        user_id: 0,
      };

      await this.paypalRepository.save(payPalRecordData as PayPalPayment);
    } catch (err) {
      const message = (err as Error).message ?? String(err);
      this.logger.error(`Failed to persist PayPal payment record: ${message}`);
    }

    return response;
  }

  async getPaymentIntent(query: GetPaymentIntentDto): Promise<PaymentIntent> {
    // TODO: Implement actual database lookup
    // This is mock data - replace with real database query
    
    const mockPaymentIntent: PaymentIntent = {
      id: Date.now(),
      order_id: 35,
      tracking_number: query.tracking_number.toString(),
      payment_gateway: query.payment_gateway,
      payment_intent_info: {
        payment_id: `pi_${Date.now()}`,
        is_redirect: query.payment_gateway === PaymentGatewayType.PAYPAL,
        client_secret: query.payment_gateway === PaymentGatewayType.STRIPE ? `secret_${Date.now()}` : null,
        redirect_url: query.payment_gateway === PaymentGatewayType.PAYPAL ? 'https://paypal.com/checkout' : null,
      },
    };
    
    return mockPaymentIntent;
  }
}