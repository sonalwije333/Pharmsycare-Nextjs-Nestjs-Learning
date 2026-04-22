// orders/orders.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
// import { PaymentModule } from 'src/payment/payment.module'; // Commented for future use
import {
  DownloadInvoiceController,
  OrderExportController,
  OrderFilesController,
  OrdersController,
  OrderStatusController,
} from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule], // PaymentModule commented for future use
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}