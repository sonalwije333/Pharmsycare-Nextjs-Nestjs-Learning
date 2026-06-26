import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { ProductSupplier } from './entities/product-supplier.entity';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { User } from '../users/entities/user.entity';
import { ProductsModule } from '../products/products.module';
import { ReorderRequest } from '../reorder-requests/entities/reorder-request.entity';
import { ProcurementRecord } from '../procurement-history/entities/procurement-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      ProductSupplier,
      User,
      ReorderRequest,
      ProcurementRecord,
    ]),
    ProductsModule,
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
