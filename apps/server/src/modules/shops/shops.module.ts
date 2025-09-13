// src/modules/shops/shops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import {
    ShopsController,
    StaffsController,
    ApproveShopController,
    DisapproveShopController,
    NearByShopController,
    NewShopsController,
} from './shops.controller';
import { User } from '../users/entities/user.entity';
import { Withdraw } from '../withdraws/entities/withdraw.entity';
import {Shop} from "./entites/shop.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Shop, User, Withdraw])],
    controllers: [
        ShopsController,
        StaffsController,
        ApproveShopController,
        DisapproveShopController,
        NearByShopController,
        NewShopsController,
    ],
    providers: [ShopsService],
    exports: [ShopsService],
})
export class ShopsModule {}