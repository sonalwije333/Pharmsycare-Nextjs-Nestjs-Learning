import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Type } from '../types/entities/type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Type])], // 👈 register entity here
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // if other modules need this service
})
export class ProductsModule {}
