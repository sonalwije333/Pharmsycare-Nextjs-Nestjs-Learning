import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShelfLocation } from './entities/shelf-location.entity';
import { ProductShelfLocation } from './entities/product-shelf-location.entity';
import { ShelfLocationsService } from './shelf-locations.service';
import { ShelfLocationsController } from './shelf-locations.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShelfLocation, ProductShelfLocation]),
    ProductsModule,
  ],
  controllers: [ShelfLocationsController],
  providers: [ShelfLocationsService],
  exports: [ShelfLocationsService],
})
export class ShelfLocationsModule {}
