// store-notices/store-notices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreNoticesController } from './store-notices.controller';
import { StoreNoticesService } from './store-notices.service';
import { StoreNotice } from './entities/store-notices.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreNotice])],
  controllers: [StoreNoticesController],
  providers: [StoreNoticesService],
})
export class StoreNoticesModule {}