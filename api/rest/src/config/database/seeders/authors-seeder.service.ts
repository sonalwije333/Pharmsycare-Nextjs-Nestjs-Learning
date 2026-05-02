// src/config/database/seeders/authors-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Author } from '../../../authors/entities/author.entity';

@Injectable()
export class AuthorsSeederService {
  private readonly logger = new Logger(AuthorsSeederService.name);

  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting authors seeder...');

    try {
      await this.clear();
      await this.seedAuthors();
      this.logger.log('✅ Authors seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed authors:', error.message);
      throw error;
    }
  }

  private async seedAuthors() {
    const filePath = await this.findJsonFile('authors.json');
    if (!filePath) {
      this.logger.warn('⚠️ Could not find authors.json file, skipping...');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      this.logger.log(`📊 Authors data loaded: ${data.length} items`);

      for (const authorData of data) {
        const author = this.authorRepository.create({
          id: authorData.id,
          name: authorData.name,
          bio: authorData.bio,
          born: authorData.born,
          death: authorData.death,
          languages: authorData.languages,
          quote: authorData.quote,
          is_approved:
            authorData.is_approved === 1 || authorData.is_approved === true,
          products_count: authorData.products_count || 0,
          slug: authorData.slug,
          image: authorData.image,
          cover_image: authorData.cover_image,
          socials: authorData.socials || [],
          language: authorData.language || 'en',
          translated_languages: authorData.translated_languages || ['en'],
          shop_id: authorData.shop_id?.toString(),
          created_at: new Date(),
          updated_at: new Date(),
        });

        await this.authorRepository.save(author);
        this.logger.debug(`   Saved author: ${author.name} (ID: ${author.id})`);
      }

      this.logger.log(`✅ Authors seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed authors:', error.message);
      throw error;
    }
  }

  private async findJsonFile(filename: string): Promise<string | null> {
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'db', 'pickbazar', filename),
      path.join(
        process.cwd(),
        'src',
        'config',
        'database',
        'pickbazar',
        filename,
      ),
      path.join(process.cwd(), 'api-src-db-pickbazar', filename),
      path.join(process.cwd(), 'database', 'pickbazar', filename),
      path.join(process.cwd(), 'db', 'pickbazar', filename),
      path.join(process.cwd(), 'pickbazar', filename),
      path.join(__dirname, '..', '..', '..', '..', 'db', 'pickbazar', filename),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        this.logger.debug(`📁 Found ${filename} at: ${p}`);
        return p;
      }
    }

    return null;
  }

  async clear() {
    this.logger.log('🧹 Clearing authors data...');

    try {
      await this.authorRepository.createQueryBuilder().delete().execute();

      this.logger.log('✅ Authors data cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear authors data:', error.message);
      throw error;
    }
  }
}
