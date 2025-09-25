import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Type } from '../types/entities/type.entity';
import { Shop } from '../shops/entites/shop.entity';
import { Tag } from '../tags/entities/tag.entity';
import { ShippingClass } from '../shippings/entities/shipping-class.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Type, Shop, Tag, ShippingClass])],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}