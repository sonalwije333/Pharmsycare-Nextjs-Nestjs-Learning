// src/config/database/seeders/terms-and-conditions-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsAndConditions } from '../../../terms-and-conditions/entities/terms-and-conditions.entity';
import termsAndConditionsJSON from '@db/terms-and-conditions.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TermsAndConditionsSeederService {
  private readonly logger = new Logger(TermsAndConditionsSeederService.name);

  constructor(
    @InjectRepository(TermsAndConditions)
    private termsRepository: Repository<TermsAndConditions>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getTermsData(): Partial<TermsAndConditions>[] {
    const terms = plainToClass(TermsAndConditions, termsAndConditionsJSON);
    const seenSlugs = new Set();
    const uniqueTerms: Partial<TermsAndConditions>[] = [];
    
    for (const term of terms) {
      if (!seenSlugs.has(term.slug)) {
        seenSlugs.add(term.slug);
        uniqueTerms.push({
          id: term.id,
          title: term.title,
          slug: term.slug,
          description: term.description,
          type: term.type,
          issued_by: term.issued_by,
          is_approved: Boolean(term.is_approved),
          language: term.language,
          translated_languages: term.translated_languages,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    return uniqueTerms;
  }

  private getAdditionalTermsData(): Partial<TermsAndConditions>[] {
    return [
      {
        title: 'Return Policy',
        description: 'Items can be returned within 30 days of purchase for a full refund. Items must be in original condition with tags attached.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: true,
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Shipping Policy',
        description: 'Orders are processed within 1-2 business days. Shipping times vary by location. Free shipping on orders over $50.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: true,
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Warranty Information',
        description: 'All products come with a standard 1-year manufacturer warranty. Extended warranty options available at checkout.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: false,
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Cookie Policy',
        description: 'This website uses cookies to enhance your browsing experience. By continuing to use this site, you consent to our use of cookies.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: true,
        language: 'en',
        translated_languages: ['en', 'es', 'fr'],
      },
      {
        title: 'Terms of Service',
        description: 'These Terms of Service govern your use of our website. Please read them carefully before using our services.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: true,
        language: 'en',
        translated_languages: ['en'],
      },
      {
        title: 'Aviso Legal',
        description: 'Este sitio web es propiedad de [Tu Empresa]. Todos los derechos reservados.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: true,
        language: 'es',
        translated_languages: ['es'],
      },
      {
        title: 'Conditions Générales',
        description: 'Ces conditions générales régissent votre utilisation de notre site Web.',
        type: 'global',
        issued_by: 'Super Admin',
        is_approved: true,
        language: 'fr',
        translated_languages: ['fr'],
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting terms and conditions seeding...');
      const terms = this.getTermsData();
      
      for (const termData of terms) {
        const existingTerm = await this.termsRepository.findOne({
          where: { slug: termData.slug },
        });

        if (!existingTerm) {
          const newTerm = this.termsRepository.create(termData);
          await this.termsRepository.save(newTerm);
          this.logger.log(`Created term: ${termData.title} (${termData.language})`);
        } else {
          this.logger.log(`Term ${termData.title} already exists`);
        }
      }

      // Seed additional terms
      const additionalTerms = this.getAdditionalTermsData();
      
      for (const termData of additionalTerms) {
        if (!termData.title) {
          this.logger.warn('Skipping term without title');
          continue;
        }
        const slug = this.generateSlug(termData.title);
        const existingTerm = await this.termsRepository.findOne({
          where: { slug: slug },
        });

        if (!existingTerm) {
          const newTerm = this.termsRepository.create({
            ...termData,
            slug: slug,
          });
          await this.termsRepository.save(newTerm);
          this.logger.log(`Created term: ${termData.title} (${termData.language})`);
        } else {
          this.logger.log(`Term ${termData.title} already exists`);
        }
      }
      
      this.logger.log('Terms and conditions seeding completed');
    } catch (error) {
      this.logger.error('Error seeding terms and conditions:', error);
      throw error;
    }
  }

  async seedByType(type: string): Promise<void> {
    try {
      this.logger.log(`Seeding terms and conditions with type: ${type}`);
      
      const additionalTerms = this.getAdditionalTermsData()
        .filter(t => t.type === type);
      
      for (const termData of additionalTerms) {
        if (!termData.title) {
          this.logger.warn('Skipping term without title');
          continue;
        }
        const slug = this.generateSlug(termData.title);
        const existingTerm = await this.termsRepository.findOne({
          where: { slug: slug },
        });

        if (!existingTerm) {
          const newTerm = this.termsRepository.create({
            ...termData,
            slug: slug,
          });
          await this.termsRepository.save(newTerm);
          this.logger.log(`Created term: ${termData.title}`);
        }
      }
      
      this.logger.log(`Terms with type ${type} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding terms with type ${type}:`, error);
      throw error;
    }
  }

  async seedByLanguage(language: string): Promise<void> {
    try {
      this.logger.log(`Seeding terms and conditions for language: ${language}`);
      
      const allTerms = [...this.getTermsData(), ...this.getAdditionalTermsData()]
        .filter(t => t.language === language);
      
      for (const termData of allTerms) {
        if (!termData.title) {
          this.logger.warn('Skipping term without title');
          continue;
        }
        const slug = this.generateSlug(termData.title);
        const existingTerm = await this.termsRepository.findOne({
          where: { slug: slug },
        });

        if (!existingTerm) {
          const newTerm = this.termsRepository.create({
            ...termData,
            slug: slug,
          });
          await this.termsRepository.save(newTerm);
          this.logger.log(`Created term: ${termData.title}`);
        }
      }
      
      this.logger.log(`Terms for language ${language} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding terms for language ${language}:`, error);
      throw error;
    }
  }

  async seedByApprovalStatus(isApproved: boolean): Promise<void> {
    try {
      this.logger.log(`Seeding ${isApproved ? 'approved' : 'pending'} terms...`);
      
      const allTerms = [...this.getTermsData(), ...this.getAdditionalTermsData()]
        .filter(t => t.is_approved === isApproved);
      
      for (const termData of allTerms) {
        if (!termData.title) {
          this.logger.warn('Skipping term without title');
          continue;
        }
        const slug = this.generateSlug(termData.title);
        const existingTerm = await this.termsRepository.findOne({
          where: { slug: slug },
        });

        if (!existingTerm) {
          const newTerm = this.termsRepository.create({
            ...termData,
            slug: slug,
          });
          await this.termsRepository.save(newTerm);
          this.logger.log(`Created term: ${termData.title}`);
        }
      }
      
      this.logger.log(`${isApproved ? 'Approved' : 'Pending'} terms seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding ${isApproved ? 'approved' : 'pending'} terms:`, error);
      throw error;
    }
  }
  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing terms and conditions...');
      await this.termsRepository.clear();
      this.logger.log('Terms and conditions cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing terms and conditions:', error);
      throw error;
    }
  }
  async getStats(): Promise<{
    total: number;
    approvedCount: number;
    pendingCount: number;
    languages: string[];
    byType: Record<string, number>;
    terms: Array<{ title: string; slug: string; type: string; is_approved: boolean }>;
  }> {
    const terms = await this.termsRepository.find(); 
    let approvedCount = 0;
    let pendingCount = 0;
    const languages = new Set<string>();
    const byType: Record<string, number> = {};
    const termsList: Array<{ title: string; slug: string; type: string; is_approved: boolean }> = [];
    for (const term of terms) {
      if (term.is_approved) {
        approvedCount++;
      } else {
        pendingCount++;
      }
      languages.add(term.language);
      byType[term.type || 'global'] = (byType[term.type || 'global'] || 0) + 1;
      
      termsList.push({
        title: term.title,
        slug: term.slug,
        type: term.type || 'global',
        is_approved: term.is_approved || false,
      });
    }
    return {
      total: terms.length,
      approvedCount,
      pendingCount,
      languages: Array.from(languages),
      byType,
      terms: termsList,
    };
  }
}