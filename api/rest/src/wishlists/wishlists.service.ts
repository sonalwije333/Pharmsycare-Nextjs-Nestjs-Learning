// wishlists/wishlists.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import { ToggleWishlistResponse, InWishlistResponse } from './dto/wishlist-response.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import wishlistsJSON from '@db/wishlists.json';
import productsJson from '@db/products.json';
import { Product } from '../products/entities/product.entity';
import { CreateWishlistDto, ToggleWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';

@Injectable()
export class WishlistsService {
  private wishlists: Wishlist[] = plainToClass(Wishlist, wishlistsJSON);
  private products: Product[] = plainToClass(Product, productsJson);

  async findAllWishlists({
    search,
    limit = 10,
    page = 1,
    user_id,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetWishlistDto): Promise<WishlistPaginator> {
    let data: Wishlist[] = [...this.wishlists];

    // Apply filters
    if (user_id) {
      data = data.filter(wishlist => wishlist.user_id === user_id);
    }

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['product_id'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

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

    const url = `/wishlists?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findWishlist(id: number): Promise<Wishlist> {
    const wishlist = this.wishlists.find(w => w.id === id);
    
    if (!wishlist) {
      throw new NotFoundException('Wishlist item not found');
    }
    
    return wishlist;
  }

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    // Check if already in wishlist
    const existingWishlist = this.wishlists.find(
      w => w.product_id === createWishlistDto.product_id && w.user_id === 1 // user_id from auth
    );
    
    if (existingWishlist) {
      throw new ConflictException('Product already in wishlist');
    }

    const newWishlist: Wishlist = {
      id: this.wishlists.length + 1,
      product_id: createWishlistDto.product_id,
      user_id: 1, // This should come from authenticated user
      created_at: new Date(),
      updated_at: new Date(),
    } as Wishlist;

    this.wishlists.push(newWishlist);
    return newWishlist;
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist> {
    const wishlistIndex = this.wishlists.findIndex(w => w.id === id);
    
    if (wishlistIndex === -1) {
      throw new NotFoundException('Wishlist item not found');
    }

    const updatedWishlist = {
      ...this.wishlists[wishlistIndex],
      ...updateWishlistDto,
      updated_at: new Date()
    };

    this.wishlists[wishlistIndex] = updatedWishlist as Wishlist;
    return updatedWishlist as Wishlist;
  }

  async delete(id: number): Promise<CoreMutationOutput> {
    const wishlistIndex = this.wishlists.findIndex(w => w.id === id);
    
    if (wishlistIndex === -1) {
      throw new NotFoundException('Wishlist item not found');
    }

    this.wishlists.splice(wishlistIndex, 1);
    
    return {
      success: true,
      message: 'Product removed from wishlist successfully'
    };
  }

  async toggle(toggleWishlistDto: ToggleWishlistDto): Promise<ToggleWishlistResponse> {
    const existingWishlist = this.wishlists.find(
      w => w.product_id === toggleWishlistDto.product_id && w.user_id === 1 // user_id from auth
    );

    let inWishlist = false;

    if (existingWishlist) {
      // Remove from wishlist
      const index = this.wishlists.findIndex(w => w.id === existingWishlist.id);
      this.wishlists.splice(index, 1);
      inWishlist = false;
    } else {
      // Add to wishlist
      const newWishlist: Wishlist = {
        id: this.wishlists.length + 1,
        product_id: toggleWishlistDto.product_id,
        user_id: 1, // This should come from authenticated user
        created_at: new Date(),
        updated_at: new Date(),
      } as Wishlist;
      this.wishlists.push(newWishlist);
      inWishlist = true;
    }

    return {
      success: true,
      message: inWishlist ? 'Product added to wishlist' : 'Product removed from wishlist',
      in_wishlist: inWishlist
    };
  }

  async isInWishlist(productId: number): Promise<InWishlistResponse> {
    const inWishlist = this.wishlists.some(
      w => w.product_id === productId && w.user_id === 1 // user_id from auth
    );
    
    return { in_wishlist: inWishlist };
  }
}