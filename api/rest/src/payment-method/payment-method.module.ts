import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import {
  PaymentMethodController,
  SavePaymentMethodController,
  SetDefaultCardController,
} from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGateway } from './entities/payment-gateway.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, PaymentGateway]), AuthModule],
  controllers: [
    PaymentMethodController,
    SetDefaultCardController,
    SavePaymentMethodController,
  ],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}