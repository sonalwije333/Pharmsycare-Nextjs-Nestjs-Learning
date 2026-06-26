import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementRecord } from './entities/procurement-record.entity';
import { ProcurementHistoryService } from './procurement-history.service';
import { ProcurementHistoryController } from './procurement-history.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcurementRecord]),
    SuppliersModule,
    ProductsModule,
  ],
  controllers: [ProcurementHistoryController],
  providers: [ProcurementHistoryService],
  exports: [ProcurementHistoryService],
})
export class ProcurementHistoryModule {}
