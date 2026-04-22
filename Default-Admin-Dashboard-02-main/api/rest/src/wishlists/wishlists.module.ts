// wishlists/wishlists.module.ts
import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { MyWishlistService } from './my-wishlists.service';
import {  WishlistsController } from './wishlists.controller';
import { MyWishlistsController } from './my-wishlists.controller';


@Module({
  controllers: [WishlistsController, MyWishlistsController],
  providers: [WishlistsService, MyWishlistService],
})
export class WishlistsModule {}