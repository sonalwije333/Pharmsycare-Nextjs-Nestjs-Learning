// src/config/database/seeders/refund-policy-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundPolicy } from '../../../refund-policies/entities/refund-policies.entity';

type RefundPolicySeedData = {
  title: string;
  target: 'vendor' | 'customer';
  status: 'approved' | 'pending' | 'rejected';
  description: string;
  language: string;
  translated_languages: string[];
};

@Injectable()
export class RefundPolicySeederService {
  private readonly logger = new Logger(RefundPolicySeederService.name);

  constructor(
    @InjectRepository(RefundPolicy)
    private refundPolicyRepository: Repository<RefundPolicy>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getRefundPoliciesData(): RefundPolicySeedData[] {
    return [
      {
        title: 'Vendor Return Policy',
        target: 'vendor',
        status: 'approved',
        description: 'Our vendor return policy ensures that you can return products within 30 days of purchase if they are damaged or not as described.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Customer Return Policy',
        target: 'customer',
        status: 'approved',
        description: 'Our customer return policy allows you to return products within 14 days of purchase for a full refund, no questions asked.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Electronics Return Policy',
        target: 'customer',
        status: 'approved',
        description: 'For electronics, our return policy extends to 60 days. We stand by the quality of our electronic products.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Furniture Return Policy',
        target: 'customer',
        status: 'approved',
        description: 'Our furniture return policy allows you to return furniture within 7 days if it doesn\'t meet your expectations. Customer satisfaction is our priority.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Custom Orders Policy',
        target: 'customer',
        status: 'approved',
        description: 'Please note that custom orders are not eligible for returns or refunds. We craft custom items to your specifications.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Digital Products Return Policy',
        target: 'customer',
        status: 'pending',
        description: 'Digital products are generally non-refundable unless there is a technical issue with the download.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Clothing Return Policy',
        target: 'customer',
        status: 'approved',
        description: 'Clothing items can be returned within 30 days if unworn with tags attached.',
        language: 'en',
        translated_languages: ['en', 'es'],
      },
      {
        title: 'Grocery Return Policy',
        target: 'customer',
        status: 'approved',
        description: 'Perishable items must be returned within 24 hours of delivery.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Pet Supplies Return Policy',
        target: 'customer',
        status: 'pending',
        description: 'Pet supplies can be returned within 14 days if unopened.',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Books Return Policy',
        target: 'customer',
        status: 'approved',
        description: 'Books can be returned within 30 days in original condition.',
        language: 'en',
        translated_languages: ['en', 'fr'],
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting refund policies seeding...');
      
      const policies = this.getRefundPoliciesData();
      
      for (const policyData of policies) {
        const existingPolicy = await this.refundPolicyRepository.findOne({
          where: { title: policyData.title },
        });

        if (!existingPolicy) {
          const newPolicy = this.refundPolicyRepository.create({
            ...policyData,
            slug: this.generateSlug(policyData.title),
          });
          await this.refundPolicyRepository.save(newPolicy);
          this.logger.log(`Created refund policy: ${policyData.title}`);
        } else {
          this.logger.log(`Refund policy already exists: ${policyData.title}`);
        }
      }
      
      this.logger.log('Refund policies seeding completed');
    } catch (error) {
      this.logger.error('Error seeding refund policies:', error);
      throw error;
    }
  }

  async seedByTarget(target: string): Promise<void> {
    try {
      this.logger.log(`Seeding refund policies for target: ${target}`);
      
      const policies = this.getRefundPoliciesData().filter(p => p.target === target);
      
      for (const policyData of policies) {
        const existingPolicy = await this.refundPolicyRepository.findOne({
          where: { title: policyData.title },
        });

        if (!existingPolicy) {
          const newPolicy = this.refundPolicyRepository.create({
            ...policyData,
            slug: this.generateSlug(policyData.title),
          });
          await this.refundPolicyRepository.save(newPolicy);
          this.logger.log(`Created refund policy: ${policyData.title}`);
        }
      }
      
      this.logger.log(`Refund policies for target ${target} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding refund policies for target ${target}:`, error);
      throw error;
    }
  }

  async seedByStatus(status: string): Promise<void> {
    try {
      this.logger.log(`Seeding refund policies with status: ${status}`);
      
      const policies = this.getRefundPoliciesData().filter(p => p.status === status);
      
      for (const policyData of policies) {
        const existingPolicy = await this.refundPolicyRepository.findOne({
          where: { title: policyData.title },
        });

        if (!existingPolicy) {
          const newPolicy = this.refundPolicyRepository.create({
            ...policyData,
            slug: this.generateSlug(policyData.title),
          });
          await this.refundPolicyRepository.save(newPolicy);
          this.logger.log(`Created refund policy: ${policyData.title}`);
        }
      }
      
      this.logger.log(`Refund policies with status ${status} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding refund policies with status ${status}:`, error);
      throw error;
    }
  }

  async seedByLanguage(language: string): Promise<void> {
    try {
      this.logger.log(`Seeding refund policies for language: ${language}`);
      
      const policies = this.getRefundPoliciesData().filter(p => p.language === language);
      
      for (const policyData of policies) {
        const existingPolicy = await this.refundPolicyRepository.findOne({
          where: { title: policyData.title },
        });

        if (!existingPolicy) {
          const newPolicy = this.refundPolicyRepository.create({
            ...policyData,
            slug: this.generateSlug(policyData.title),
          });
          await this.refundPolicyRepository.save(newPolicy);
          this.logger.log(`Created refund policy: ${policyData.title}`);
        }
      }
      
      this.logger.log(`Refund policies for language ${language} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding refund policies for language ${language}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing refund policies...');
      await this.refundPolicyRepository.clear();
      this.logger.log('Refund policies cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing refund policies:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    byTarget: { vendor: number; customer: number };
    byStatus: { approved: number; pending: number; rejected: number };
    languages: string[];
  }> {
    const policies = await this.refundPolicyRepository.find();
    
    const byTarget = {
      vendor: policies.filter(p => p.target === 'vendor').length,
      customer: policies.filter(p => p.target === 'customer').length,
    };
    
    const byStatus = {
      approved: policies.filter(p => p.status === 'approved').length,
      pending: policies.filter(p => p.status === 'pending').length,
      rejected: policies.filter(p => p.status === 'rejected').length,
    };
    
    const languages = [...new Set(policies.flatMap(p => p.translated_languages))];
    
    return {
      total: policies.length,
      byTarget,
      byStatus,
      languages,
    };
  }
}