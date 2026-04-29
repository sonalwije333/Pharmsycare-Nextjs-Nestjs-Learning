// shops/shops.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  private shops: Shop[] = plainToClass(Shop, shopsJson);
  private nearShops: Shop[] = plainToClass(Shop, nearShopJson);

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createShopDto: CreateShopDto, userId?: number): Promise<Shop> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingShop = await this.shopsRepository.findOne({
      where: { name: createShopDto.name },
    });
    if (existingShop) {
      throw new NotFoundException('Shop with this name already exists');
    }

    const { categories, ...shopPayload } = createShopDto;
    const newShop = this.shopsRepository.create({
      ...shopPayload,
      name: createShopDto.name,
      slug: this.generateSlug(createShopDto.name),
      owner_id: userId,
      owner: { id: userId } as any,
      is_active: false,
      orders_count: 0,
      products_count: 0,
    });

    const savedShop = await this.shopsRepository.save(newShop);

    this.shops.push(savedShop);
    return savedShop;
  }

  async getShops({
    search,
    name,
    limit = 10,
    page = 1,
    is_active,
    owner_id,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetShopsDto): Promise<ShopPaginator> {
    let data: Shop[] = [...this.shops];
    const searchText = search || name;

    if (is_active !== undefined) {
      data = data.filter(shop => shop.is_active == is_active);
    }

    if (owner_id) {
      data = data.filter(shop => shop.owner_id === owner_id);
    }

    if (searchText) {
      const fuse = new Fuse(data, {
        keys: ['name', 'description'],
        threshold: 0.3,
      });
      data = fuse.search(searchText)?.map(({ item }) => item);
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
    name,
    limit = 10,
    page = 1,
  }: GetShopsDto): Promise<ShopPaginator> {
    let data: Shop[] = this.shops.filter(shop => shop.is_active === false);
    const searchText = search || name;

    if (searchText) {
      const fuse = new Fuse(data, {
        keys: ['name'],
        threshold: 0.3,
      });
      data = fuse.search(searchText)?.map(({ item }) => item);
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