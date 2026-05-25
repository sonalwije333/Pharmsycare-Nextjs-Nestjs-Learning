// flash-sale/flash-sale.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApproveVendorRequestForFlashSaleController,
  DisapproveVendorRequestForFlashSaleController,
  FlashSaleController,
  ProductsByFlashSaleController,
  VendorRequestsForFlashSaleController,
} from './flash-sale.controller';
import { FlashSaleService } from './flash-sale.service';
import { FlashSale } from './entities/flash-sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSale])],
  controllers: [
    FlashSaleController,
    ProductsByFlashSaleController,
    VendorRequestsForFlashSaleController,
    ApproveVendorRequestForFlashSaleController,
    DisapproveVendorRequestForFlashSaleController,
  ],
  providers: [FlashSaleService],
  exports: [FlashSaleService],
})
export class FlashSaleModule {}
