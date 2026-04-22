// src/config/database/seeders/shop-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../../shops/entities/shop.entity';
import shopsJson from '@db/shops.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ShopSeederService {
  private readonly logger = new Logger(ShopSeederService.name);

  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  private generateSlug(name?: string): string {
    return (name ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getShopsData(): Partial<Shop>[] {
    const shops = plainToClass(Shop, shopsJson);
    return shops.map((shop: any) => ({
      id: shop.id,
      owner_id: shop.owner_id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      cover_image: shop.cover_image,
      logo: shop.logo,
      is_active: shop.is_active,
      address: shop.address,
      settings: shop.settings,
      orders_count: shop.orders_count || 0,
      products_count: shop.products_count || 0,
      created_at: shop.created_at ? new Date(shop.created_at) : new Date(),
      updated_at: shop.updated_at ? new Date(shop.updated_at) : new Date(),
    }));
  }

  private getAdditionalShopsData(): Partial<Shop>[] {
    return [
      {
        name: 'Electronics Hub',
        description: 'Your one-stop shop for all electronics and gadgets',
        is_active: true,
        address: {
          country: 'USA',
          city: 'Austin',
          state: 'Texas',
          zip: '78701',
          street_address: '123 Tech Street'
        },
        settings: {
          contact: '+15125550123',
          website: 'https://electronicshub.com',
          socials: [
            { icon: 'FacebookIcon', url: 'https://facebook.com/electronicshub' },
            { icon: 'InstagramIcon', url: 'https://instagram.com/electronicshub' }
          ]
        }
      },
      {
        name: 'Sports Direct',
        description: 'Premium sports equipment and apparel',
        is_active: true,
        address: {
          country: 'USA',
          city: 'Denver',
          state: 'Colorado',
          zip: '80202',
          street_address: '456 Sports Ave'
        },
        settings: {
          contact: '+17205550123',
          website: 'https://sportsdirect.com',
          socials: [
            { icon: 'TwitterIcon', url: 'https://twitter.com/sportsdirect' }
          ]
        }
      },
      {
        name: 'Pet Paradise',
        description: 'Everything your pet needs',
        is_active: false,
        address: {
          country: 'Canada',
          city: 'Toronto',
          state: 'Ontario',
          zip: 'M5V 2T6',
          street_address: '789 Pet Lane'
        },
        settings: {
          contact: '+14165550123',
          website: 'https://petparadise.ca'
        }
      }
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting shops seeding...');
      
      // Seed existing data from JSON
      const shops = this.getShopsData();
      
      for (const shopData of shops) {
        const existingShop = await this.shopRepository.findOne({
          where: { id: shopData.id },
        });

        if (!existingShop) {
          const newShop = this.shopRepository.create(shopData);
          await this.shopRepository.save(newShop);
          this.logger.log(`Created shop: ${shopData.name}`);
        } else {
          this.logger.log(`Shop ${shopData.name} already exists`);
        }
      }

      // Seed additional shops
      const additionalShops = this.getAdditionalShopsData();
      
      for (const shopData of additionalShops) {
        const existingShop = await this.shopRepository.findOne({
          where: { name: shopData.name },
        });

        if (!existingShop) {
          const newShopData: Partial<Shop> = {
            ...shopData,
            owner_id: 1,
            orders_count: 0,
            products_count: 0,
            cover_image: undefined,
            logo: undefined,
          };
          const newShop = this.shopRepository.create(newShopData);
          await this.shopRepository.save(newShop);
          this.logger.log(`Created shop: ${shopData.name}`);
        } else {
          this.logger.log(`Shop ${shopData.name} already exists`);
        }
      }
      
      this.logger.log('Shops seeding completed');
    } catch (error) {
      this.logger.error('Error seeding shops:', error);
      throw error;
    }
  }

  async seedByOwnerId(ownerId: number): Promise<void> {
    try {
      this.logger.log(`Seeding shops for owner ID: ${ownerId}`);
      
      const shops = this.getShopsData().filter(s => s.owner_id === ownerId);
      
      for (const shopData of shops) {
        const existingShop = await this.shopRepository.findOne({
          where: { id: shopData.id },
        });

        if (!existingShop) {
          const newShop = this.shopRepository.create(shopData);
          await this.shopRepository.save(newShop);
          this.logger.log(`Created shop: ${shopData.name}`);
        }
      }
      
      this.logger.log(`Shops for owner ${ownerId} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding shops for owner ${ownerId}:`, error);
      throw error;
    }
  }

  async seedByActiveStatus(isActive: boolean): Promise<void> {
    try {
      this.logger.log(`Seeding ${isActive ? 'active' : 'inactive'} shops...`);
      
      const shops = this.getShopsData().filter(s => s.is_active === isActive);
      
      for (const shopData of shops) {
        const existingShop = await this.shopRepository.findOne({
          where: { id: shopData.id },
        });

        if (!existingShop) {
          const newShop = this.shopRepository.create(shopData);
          await this.shopRepository.save(newShop);
          this.logger.log(`Created shop: ${shopData.name}`);
        }
      }
      
      this.logger.log(`${isActive ? 'Active' : 'Inactive'} shops seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding ${isActive ? 'active' : 'inactive'} shops:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing shops...');
      await this.shopRepository.clear();
      this.logger.log('Shops cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing shops:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    activeCount: number;
    inactiveCount: number;
    totalProducts: number;
    totalOrders: number;
    avgProductsPerShop: number;
  }> {
    const shops = await this.shopRepository.find();
    
    let activeCount = 0;
    let inactiveCount = 0;
    let totalProducts = 0;
    let totalOrders = 0;
    
    for (const shop of shops) {
      if (shop.is_active) {
        activeCount++;
      } else {
        inactiveCount++;
      }
      totalProducts += shop.products_count || 0;
      totalOrders += shop.orders_count || 0;
    }
    
    const avgProductsPerShop = shops.length > 0 ? totalProducts / shops.length : 0;
    
    return {
      total: shops.length,
      activeCount,
      inactiveCount,
      totalProducts,
      totalOrders,
      avgProductsPerShop,
    };
  }
}