// shops/shops.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { Shop } from './entities/shop.entity';
import { UserPaginator } from 'src/users/dto/get-users.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import shopsJson from '@db/shops.json';
import nearShopJson from '@db/near-shop.json';

@Injectable()
export class ShopsService {
  private shops: Shop[] = plainToClass(Shop, shopsJson);
  private nearShops: Shop[] = plainToClass(Shop, nearShopJson);

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const existingShop = this.shops.find(s => s.name === createShopDto.name);
    if (existingShop) {
      throw new NotFoundException('Shop with this name already exists');
    }

    const newShop: Shop = {
      id: this.shops.length + 1,
      name: createShopDto.name,
      slug: this.generateSlug(createShopDto.name),
      description: createShopDto.description,
      address: createShopDto.address,
      cover_image: createShopDto.cover_image,
      logo: createShopDto.logo,
      settings: createShopDto.settings,
      balance: createShopDto.balance,
      owner_id: 1, // This should come from authenticated user
      is_active: false,
      orders_count: 0,
      products_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    } as Shop;

    this.shops.push(newShop);
    return newShop;
  }

  async getShops({
    search,
    limit = 10,
    page = 1,
    is_active,
    owner_id,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetShopsDto): Promise<ShopPaginator> {
    let data: Shop[] = [...this.shops];

    if (is_active !== undefined) {
      data = data.filter(shop => shop.is_active === is_active);
    }

    if (owner_id) {
      data = data.filter(shop => shop.owner_id === owner_id);
    }

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['name', 'description'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'orders_count':
          aValue = a.orders_count;
          bValue = b.orders_count;
          break;
        case 'products_count':
          aValue = a.products_count;
          bValue = b.products_count;
          break;
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

    const url = `/shops?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getNewShops({
    search,
    limit = 10,
    page = 1,
  }: GetShopsDto): Promise<ShopPaginator> {
    let data: Shop[] = this.shops.filter(shop => shop.is_active === false);

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['name'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/new-shops?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getStaffs({ shop_id, limit = 10, page = 1 }: GetStaffsDto): Promise<UserPaginator> {
    const shop = this.shops.find(s => s.id === shop_id);
    const staffs = shop?.staffs || [];
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = staffs.slice(startIndex, endIndex);

    const url = `/staffs?limit=${limit}`;
    const paginationInfo = paginate(staffs.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getShop(slug: string): Promise<Shop> {
    const shop = this.shops.find(s => s.slug === slug);
    
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    
    return shop;
  }

  async getNearByShop(lat: string, lng: string): Promise<Shop[]> {
    return this.nearShops;
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shopIndex = this.shops.findIndex(s => s.id === id);
    
    if (shopIndex === -1) {
      throw new NotFoundException('Shop not found');
    }

    const updatedShop = {
      ...this.shops[shopIndex],
      ...updateShopDto,
      updated_at: new Date()
    };

    if (updateShopDto.name) {
      updatedShop.slug = this.generateSlug(updateShopDto.name);
    }

    this.shops[shopIndex] = updatedShop as Shop;
    return updatedShop as Shop;
  }

  async approveShop(id: number): Promise<Shop> {
    const shopIndex = this.shops.findIndex(s => s.id === id);
    
    if (shopIndex === -1) {
      throw new NotFoundException('Shop not found');
    }

    this.shops[shopIndex].is_active = true;
    this.shops[shopIndex].updated_at = new Date();
    
    return this.shops[shopIndex];
  }

  async disapproveShop(id: number): Promise<Shop> {
    const shopIndex = this.shops.findIndex(s => s.id === id);
    
    if (shopIndex === -1) {
      throw new NotFoundException('Shop not found');
    }

    this.shops[shopIndex].is_active = false;
    this.shops[shopIndex].updated_at = new Date();
    
    return this.shops[shopIndex];
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const shopIndex = this.shops.findIndex(s => s.id === id);
    
    if (shopIndex === -1) {
      throw new NotFoundException('Shop not found');
    }

    this.shops.splice(shopIndex, 1);
    
    return {
      success: true,
      message: 'Shop deleted successfully'
    };
  }
}