import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReorderRequest } from './entities/reorder-request.entity';
import { ReorderRequestsService } from './reorder-requests.service';
import { ReorderRequestsController } from './reorder-requests.controller';
import { ReorderNotificationService } from './reorder-notification.service';
import { ProductsModule } from '../products/products.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProcurementHistoryModule } from '../procurement-history/procurement-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReorderRequest]),
    ProductsModule,
    SuppliersModule,
    ProcurementHistoryModule,
  ],
  controllers: [ReorderRequestsController],
  providers: [ReorderRequestsService, ReorderNotificationService],
  exports: [ReorderRequestsService],
})
export class ReorderRequestsModule {}
