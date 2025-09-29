import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController, OrderStatusController } from './orders.controller';
import { Order, OrderFiles } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderStatus, OrderFiles])],
  controllers: [OrdersController, OrderStatusController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}