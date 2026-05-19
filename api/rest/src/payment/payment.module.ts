import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { PayPalPayment } from './entities/paypal.entity';
import { StripePayment, StripeCustomer, StripeRefund } from './entities/stripe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PayPalPayment, StripePayment, StripeCustomer, StripeRefund]), AuthModule],
  providers: [StripePaymentService, PaypalPaymentService],
  exports: [StripePaymentService, PaypalPaymentService, TypeOrmModule],
})
export class PaymentModule {}