import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingsService } from './shippings.service';
import { ShippingsController } from './shippings.controller';
import { Shipping } from './entities/shipping.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Shipping])],
    controllers: [ShippingsController],
    providers: [ShippingsService],
    exports: [ShippingsService],
})
export class ShippingsModule {}