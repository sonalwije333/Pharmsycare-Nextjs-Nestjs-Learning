// src/config/database/seeders/tax-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from '../../../taxes/entities/tax.entity';
import taxesJson from '@db/taxes.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TaxSeederService {
  private readonly logger = new Logger(TaxSeederService.name);

  constructor(
    @InjectRepository(Tax)
    private taxRepository: Repository<Tax>,
  ) {}

  private getTaxesData(): Partial<Tax>[] {
    const taxes = plainToClass(Tax, taxesJson);
    return taxes.map((tax: any) => ({
      id: tax.id,
      name: tax.name,
      rate: tax.rate,
      is_global: tax.is_global,
      country: tax.country,
      state: tax.state,
      zip: tax.zip,
      city: tax.city,
      priority: tax.priority,
      on_shipping: tax.on_shipping,
      created_at: tax.created_at ? new Date(tax.created_at) : new Date(),
      updated_at: tax.updated_at ? new Date(tax.updated_at) : new Date(),
    }));
  }

  private getAdditionalTaxesData(): Partial<Tax>[] {
    return [
      {
        name: 'US Federal Tax',
        rate: 5,
        is_global: false,
        country: 'USA',
        state: null,
        zip: null,
        city: null,
        priority: 1,
        on_shipping: true,
      },
      {
        name: 'California State Tax',
        rate: 7.25,
        is_global: false,
        country: 'USA',
        state: 'California',
        zip: null,
        city: null,
        priority: 2,
        on_shipping: true,
      },
      {
        name: 'New York State Tax',
        rate: 8.5,
        is_global: false,
        country: 'USA',
        state: 'New York',
        zip: null,
        city: null,
        priority: 2,
        on_shipping: true,
      },
      {
        name: 'Texas State Tax',
        rate: 6.25,
        is_global: false,
        country: 'USA',
        state: 'Texas',
        zip: null,
        city: null,
        priority: 2,
        on_shipping: true,
      },
      {
        name: 'UK VAT',
        rate: 20,
        is_global: false,
        country: 'UK',
        state: null,
        zip: null,
        city: null,
        priority: 1,
        on_shipping: true,
      },
      {
        name: 'Canada GST',
        rate: 5,
        is_global: false,
        country: 'Canada',
        state: null,
        zip: null,
        city: null,
        priority: 1,
        on_shipping: true,
      },
      {
        name: 'EU VAT Standard',
        rate: 21,
        is_global: false,
        country: 'Germany',
        state: null,
        zip: null,
        city: null,
        priority: 1,
        on_shipping: true,
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting taxes seeding...');
      
      // Seed existing data from JSON
      const taxes = this.getTaxesData();
      
      for (const taxData of taxes) {
        const existingTax = await this.taxRepository.findOne({
          where: { id: taxData.id },
        });

        if (!existingTax) {
          const newTax = this.taxRepository.create(taxData);
          await this.taxRepository.save(newTax);
          this.logger.log(`Created tax: ${taxData.name} (${taxData.rate}%)`);
        } else {
          this.logger.log(`Tax ${taxData.name} already exists`);
        }
      }

      // Seed additional taxes
      const additionalTaxes = this.getAdditionalTaxesData();
      
      for (const taxData of additionalTaxes) {
        const existingTax = await this.taxRepository.findOne({
          where: { name: taxData.name, country: taxData.country ?? undefined },
        });

        if (!existingTax) {
          const newTax = this.taxRepository.create(taxData);
          await this.taxRepository.save(newTax);
          this.logger.log(`Created tax: ${taxData.name} (${taxData.rate}%)`);
        } else {
          this.logger.log(`Tax ${taxData.name} already exists`);
        }
      }
      
      this.logger.log('Taxes seeding completed');
    } catch (error) {
      this.logger.error('Error seeding taxes:', error);
      throw error;
    }
  }

  async seedByCountry(country: string): Promise<void> {
    try {
      this.logger.log(`Seeding taxes for country: ${country}`);
      
      const taxes = this.getAdditionalTaxesData()
        .filter(t => t.country === country);
      
      for (const taxData of taxes) {
        const existingTax = await this.taxRepository.findOne({
          where: { name: taxData.name, country: taxData.country ?? undefined },
        });

        if (!existingTax) {
          const newTax = this.taxRepository.create(taxData);
          await this.taxRepository.save(newTax);
          this.logger.log(`Created tax: ${taxData.name} (${taxData.rate}%)`);
        }
      }
      
      this.logger.log(`Taxes for country ${country} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding taxes for country ${country}:`, error);
      throw error;
    }
  }

  async seedByState(state: string): Promise<void> {
    try {
      this.logger.log(`Seeding taxes for state: ${state}`);
      
      const taxes = this.getAdditionalTaxesData()
        .filter(t => t.state === state);
      
      for (const taxData of taxes) {
        const existingTax = await this.taxRepository.findOne({
          where: { name: taxData.name, state: taxData.state ?? undefined },
        });

        if (!existingTax) {
          const newTax = this.taxRepository.create(taxData);
          await this.taxRepository.save(newTax);
          this.logger.log(`Created tax: ${taxData.name} (${taxData.rate}%)`);
        }
      }
      
      this.logger.log(`Taxes for state ${state} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding taxes for state ${state}:`, error);
      throw error;
    }
  }

  async seedByGlobalStatus(isGlobal: boolean): Promise<void> {
    try {
      this.logger.log(`Seeding ${isGlobal ? 'global' : 'non-global'} taxes...`);
      
      const taxes = this.getAdditionalTaxesData()
        .filter(t => t.is_global === isGlobal);
      
      for (const taxData of taxes) {
        const existingTax = await this.taxRepository.findOne({
          where: { name: taxData.name },
        });

        if (!existingTax) {
          const newTax = this.taxRepository.create(taxData);
          await this.taxRepository.save(newTax);
          this.logger.log(`Created tax: ${taxData.name} (${taxData.rate}%)`);
        }
      }
      
      this.logger.log(`${isGlobal ? 'Global' : 'Non-global'} taxes seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding ${isGlobal ? 'global' : 'non-global'} taxes:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing taxes...');
      await this.taxRepository.clear();
      this.logger.log('Taxes cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing taxes:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    globalCount: number;
    locationBasedCount: number;
    averageRate: number;
    taxOnShippingCount: number;
    byCountry: Record<string, number>;
  }> {
    const taxes = await this.taxRepository.find();
    
    let globalCount = 0;
    let locationBasedCount = 0;
    let taxOnShippingCount = 0;
    let totalRate = 0;
    const byCountry: Record<string, number> = {};
    
    for (const tax of taxes) {
      if (tax.is_global) {
        globalCount++;
      } else {
        locationBasedCount++;
      }
      
      if (tax.on_shipping) {
        taxOnShippingCount++;
      }
      
      totalRate += tax.rate;
      
      const countryKey = tax.country || 'Global';
      byCountry[countryKey] = (byCountry[countryKey] || 0) + 1;
    }
    
    const averageRate = taxes.length > 0 ? totalRate / taxes.length : 0;
    
    return {
      total: taxes.length,
      globalCount,
      locationBasedCount,
      averageRate,
      taxOnShippingCount,
      byCountry,
    };
  }
}