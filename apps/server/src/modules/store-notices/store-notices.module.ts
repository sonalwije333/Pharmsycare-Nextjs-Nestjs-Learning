// src/modules/store-notices/store-notices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreNoticesService } from './store-notices.service';
import { StoreNoticesController } from './store-notices.controller';
import { StoreNotice } from './entities/store-notices.entity';
import { User } from '../users/entities/user.entity';
import {Shop} from "../shops/entites/shop.entity";

@Module({
    imports: [TypeOrmModule.forFeature([StoreNotice, Shop, User])],
    controllers: [StoreNoticesController],
    providers: [StoreNoticesService],
    exports: [StoreNoticesService],
})
export class StoreNoticesModule {}