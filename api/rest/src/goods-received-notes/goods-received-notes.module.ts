import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsReceivedNote } from './entities/goods-received-note.entity';
import { GrnItem } from './entities/goods-received-note-item.entity';
import { GoodsReceivedNotesService } from './goods-received-notes.service';
import { GoodsReceivedNotesController } from './goods-received-notes.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductsModule } from '../products/products.module';
import { ProcurementHistoryModule } from '../procurement-history/procurement-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceivedNote, GrnItem]),
    SuppliersModule,
    ProductsModule,
    ProcurementHistoryModule,
  ],
  controllers: [GoodsReceivedNotesController],
  providers: [GoodsReceivedNotesService],
  exports: [GoodsReceivedNotesService],
})
export class GoodsReceivedNotesModule {}
