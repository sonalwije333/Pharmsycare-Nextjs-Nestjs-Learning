import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingsService } from './shippings.service';
import { ShippingsController } from './shippings.controller';
import { Shipping } from './entities/shipping.entity';
import { ShippingClass } from './entities/shipping-class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipping, ShippingClass])],
  controllers: [ShippingsController],
  providers: [ShippingsService],
  exports: [ShippingsService],
})
export class ShippingsModule {}
