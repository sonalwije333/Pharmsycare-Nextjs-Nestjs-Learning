// payment-intent/payment-intent.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntent } from './entities/payment-intent.entity';

@Injectable()
export class PaymentIntentService {
  async getPaymentIntent(query: GetPaymentIntentDto): Promise<PaymentIntent> {
    // TODO: Implement actual database lookup
    // This is mock data for demonstration
    return {
      id: 6,
      order_id: 35,
      tracking_number: query.tracking_number.toString(),
      payment_gateway: query.payment_gateway,
      payment_intent_info: {
        payment_id: 'pi_mock_' + Date.now(),
        is_redirect: false,
        client_secret: 'secret_mock_' + Date.now(),
      },
    };
  }
}