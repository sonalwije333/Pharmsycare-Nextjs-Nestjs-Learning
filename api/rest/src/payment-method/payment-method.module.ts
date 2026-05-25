// payment-method/payment-method.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import {
  PaymentMethodController,
  SavePaymentMethodController,
  SetDefaultCartController,
} from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';

@Module({
  imports: [AuthModule, PaymentModule],
  controllers: [
    PaymentMethodController,
    SetDefaultCartController,
    SavePaymentMethodController,
  ],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}