import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodController, SetDefaultCartController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGateWay } from './entities/payment-gateway.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, PaymentGateWay])],
  controllers: [PaymentMethodController, SetDefaultCartController],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}