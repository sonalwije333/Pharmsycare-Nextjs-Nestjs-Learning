// wishlists/my-wishlists.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import wishlistsJSON from '@db/wishlists.json';
import productsJson from '@db/products.json';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class MyWishlistService {
  private wishlists: Wishlist[] = plainToClass(Wishlist, wishlistsJSON);
  private products: Product[] = plainToClass(Product, productsJson);

  async findMyWishlists({
    limit = 10,
    page = 1,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetWishlistDto): Promise<WishlistPaginator> {
    // Get wishlist items for current user (user_id = 1 for demo)
    const userWishlists = this.wishlists.filter(w => w.user_id === 1);
    
    // Get product details for each wishlist item
    const data = userWishlists.map(wishlistItem => {
      const product = this.products.find(p => p.id === wishlistItem.product_id);
      return {
        ...wishlistItem,
        product: product,
        in_wishlist: true
      };
    });

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (orderBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/my-wishlists?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results as Wishlist[],
      ...paginationInfo,
    };
  }

  async findMyWishlist(id: number): Promise<Wishlist> {
    const wishlist = this.wishlists.find(w => w.id === id && w.user_id === 1);
    
    if (!wishlist) {
      throw new NotFoundException('Wishlist item not found');
    }
    
    const product = this.products.find(p => p.id === wishlist.product_id);
    
    return {
      ...wishlist,
      product: product,
      in_wishlist: true
    } as Wishlist;
  }
}