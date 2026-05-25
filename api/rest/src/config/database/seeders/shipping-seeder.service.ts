// src/config/database/seeders/shipping-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import shippingsJson from '@db/shippings.json';
import { plainToClass } from 'class-transformer';
import { Shipping, ShippingType } from 'src/shippings/entities/shipping.entity';

@Injectable()
export class ShippingSeederService {
  private readonly logger = new Logger(ShippingSeederService.name);

  constructor(
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
  ) {}

  private getShippingsData(): Partial<Shipping>[] {
    const shippings = plainToClass(Shipping, shippingsJson);
    return shippings.map((shipping: any) => ({
      id: shipping.id,
      name: shipping.name,
      amount: shipping.amount,
      is_global: shipping.is_global,
      type: shipping.type,
      // shop_id: shipping.shop_id, // Commented for future use
      created_at: shipping.created_at ? new Date(shipping.created_at) : new Date(),
      updated_at: shipping.updated_at ? new Date(shipping.updated_at) : new Date(),
    }));
  }

  private getAdditionalShippingsData(): Partial<Shipping>[] {
    return [
      {
        name: 'Express Shipping',
        amount: 25,
        is_global: true,
        type: ShippingType.FIXED,
      },
      {
        name: 'Standard Shipping',
        amount: 15,
        is_global: true,
        type: ShippingType.FIXED,
      },
      {
        name: 'Free Shipping',
        amount: 0,
        is_global: true,
        type: ShippingType.FREE,
      },
      {
        name: 'Percentage Based',
        amount: 10,
        is_global: false,
        type: ShippingType.PERCENTAGE,
      },
      {
        name: 'Overnight Delivery',
        amount: 50,
        is_global: false,
        type: ShippingType.FIXED,
      },
      {
        name: 'International Shipping',
        amount: 100,
        is_global: false,
        type: ShippingType.FIXED,
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting shippings seeding...');
      
      // Seed existing data from JSON
      const shippings = this.getShippingsData();
      
      for (const shippingData of shippings) {
        const existingShipping = await this.shippingRepository.findOne({
          where: { id: shippingData.id },
        });

        if (!existingShipping) {
          const newShipping = this.shippingRepository.create(shippingData);
          await this.shippingRepository.save(newShipping);
          this.logger.log(`Created shipping: ${shippingData.name}`);
        } else {
          this.logger.log(`Shipping ${shippingData.name} already exists`);
        }
      }

      // Seed additional shipping methods
      const additionalShippings = this.getAdditionalShippingsData();
      
      for (const shippingData of additionalShippings) {
        const existingShipping = await this.shippingRepository.findOne({
          where: { name: shippingData.name },
        });

        if (!existingShipping) {
          const newShipping = this.shippingRepository.create(shippingData);
          await this.shippingRepository.save(newShipping);
          this.logger.log(`Created shipping: ${shippingData.name}`);
        } else {
          this.logger.log(`Shipping ${shippingData.name} already exists`);
        }
      }
      
      this.logger.log('Shippings seeding completed');
    } catch (error) {
      this.logger.error('Error seeding shippings:', error);
      throw error;
    }
  }

  async seedByType(type: string): Promise<void> {
    try {
      this.logger.log(`Seeding shippings with type: ${type}`);
      
      const additionalShippings = this.getAdditionalShippingsData()
        .filter(s => s.type === type);
      
      for (const shippingData of additionalShippings) {
        const existingShipping = await this.shippingRepository.findOne({
          where: { name: shippingData.name },
        });

        if (!existingShipping) {
          const newShipping = this.shippingRepository.create(shippingData);
          await this.shippingRepository.save(newShipping);
          this.logger.log(`Created shipping: ${shippingData.name}`);
        }
      }
      
      this.logger.log(`Shippings with type ${type} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding shippings with type ${type}:`, error);
      throw error;
    }
  }

  async seedByGlobalStatus(isGlobal: boolean): Promise<void> {
    try {
      this.logger.log(`Seeding ${isGlobal ? 'global' : 'non-global'} shippings...`);
      
      const additionalShippings = this.getAdditionalShippingsData()
        .filter(s => s.is_global === isGlobal);
      
      for (const shippingData of additionalShippings) {
        const existingShipping = await this.shippingRepository.findOne({
          where: { name: shippingData.name },
        });

        if (!existingShipping) {
          const newShipping = this.shippingRepository.create(shippingData);
          await this.shippingRepository.save(newShipping);
          this.logger.log(`Created shipping: ${shippingData.name}`);
        }
      }
      
      this.logger.log(`${isGlobal ? 'Global' : 'Non-global'} shippings seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding ${isGlobal ? 'global' : 'non-global'} shippings:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing shippings...');
      await this.shippingRepository.clear();
      this.logger.log('Shippings cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing shippings:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    globalCount: number;
    nonGlobalCount: number;
    averageAmount: number;
  }> {
    const shippings = await this.shippingRepository.find();
    
    const byType: Record<string, number> = {};
    let globalCount = 0;
    let nonGlobalCount = 0;
    let totalAmount = 0;
    
    for (const shipping of shippings) {
      byType[shipping.type] = (byType[shipping.type] || 0) + 1;
      
      if (shipping.is_global) {
        globalCount++;
      } else {
        nonGlobalCount++;
      }
      
      totalAmount += shipping.amount;
    }
    
    const averageAmount = shippings.length > 0 ? totalAmount / shippings.length : 0;
    
    return {
      total: shippings.length,
      byType,
      globalCount,
      nonGlobalCount,
      averageAmount,
    };
  }
}