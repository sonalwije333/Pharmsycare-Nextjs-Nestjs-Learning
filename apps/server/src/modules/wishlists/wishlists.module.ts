import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { WishlistsController } from './wishlists.controller';
import { MyWishlistsController } from './my-wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { MyWishlistService } from './my-wishlists.service';

@Module({
    imports: [TypeOrmModule.forFeature([Wishlist, Product, User])],
    controllers: [WishlistsController, MyWishlistsController],
    providers: [WishlistsService, MyWishlistService],
    exports: [WishlistsService, MyWishlistService],
})
export class WishlistsModule {}