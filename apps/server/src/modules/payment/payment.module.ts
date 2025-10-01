import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import {PaymentController} from "./payment.controller";
import {StripePaymentService} from "./stripe-payment.service";


@Module({
  imports: [
    AuthModule,
    // StripeModule.forRoot({
    //     apiKey: process.env.STRIPE_SECRET_KEY,
    //     apiVersion: '2023-10-16',
    // }),
  ],
  controllers: [PaymentController],
  providers: [StripePaymentService],
  exports: [StripePaymentService],
})
export class PaymentModule {}