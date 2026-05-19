import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentIntentController } from './payment-intent.controller';
import { PaymentIntentService } from './payment-intent.service';
import { PayPalPayment } from '../payment/entities/paypal.entity';
import { StripePayment } from '../payment/entities/stripe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PayPalPayment, StripePayment])],
  controllers: [PaymentIntentController],
  providers: [PaymentIntentService],
  exports: [PaymentIntentService],
})
export class PaymentIntentModule {}