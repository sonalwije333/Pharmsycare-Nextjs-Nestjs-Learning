import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSaleController, ProductsByFlashSaleController } from "./flash-sale.controller";
import { FlashSaleService } from "./flash-sale.service";
import { FlashSale } from './entities/flash-sale.entity';
import { Product } from '../products/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([FlashSale, Product]), // This makes the repositories available
    ],
    controllers: [FlashSaleController, ProductsByFlashSaleController],
    providers: [FlashSaleService],
})
export class FlashSaleModule {}