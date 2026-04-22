import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from '../../../categories/entities/category.entity';
import { Type } from '../../../types/entities/type.entity';

@Injectable()
export class CategoriesSeederService {
  private readonly logger = new Logger(CategoriesSeederService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting categories seeder...');

    try {
      await this.clear();
      await this.seedCategories();
      this.logger.log('✅ Categories seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed categories:', error.message);
      throw error;
    }
  }

  private async seedCategories() {
    const filePath = await this.findJsonFile('categories.json');
    if (!filePath) {
      this.logger.warn('⚠️ Could not find categories.json file, skipping...');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const availableTypes = await this.typeRepository.find();
      const typeById = new Map<number, Type>();
      const typeBySlug = new Map<string, Type>();

      for (const type of availableTypes) {
        if (typeof type.id === 'number') {
          typeById.set(type.id, type);
        }
        if (type.slug) {
          typeBySlug.set(String(type.slug).toLowerCase(), type);
        }
      }

      if (!availableTypes.length) {
        throw new Error(
          'No types found in database. Seed types first before categories.',
        );
      }

      this.logger.log(`📊 Categories data loaded: ${data.length} items`);

      // First pass: Save all categories without parent relationships
      const categoryMap = new Map();

      for (const categoryData of data) {
        const typeFromId =
          typeof categoryData.type_id === 'number'
            ? typeById.get(categoryData.type_id)
            : undefined;
        const typeSlug = categoryData?.type?.slug
          ? String(categoryData.type.slug).toLowerCase()
          : undefined;
        const typeFromSlug = typeSlug ? typeBySlug.get(typeSlug) : undefined;
        const resolvedType = typeFromSlug || typeFromId;

        if (!resolvedType) {
          this.logger.warn(
            `⚠️ Skipping category ${categoryData.name} (ID: ${categoryData.id}) - type not found for type_id=${categoryData.type_id}${typeSlug ? `, type_slug=${typeSlug}` : ''}`,
          );
          continue;
        }

        const category = this.categoryRepository.create({
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          details: categoryData.details,
          image: categoryData.image,
          icon: categoryData.icon,
          type_id: resolvedType.id,
          type: resolvedType,
          language: categoryData.language || 'en',
          translated_languages: categoryData.translated_languages || ['en'],
          created_at: categoryData.created_at
            ? new Date(categoryData.created_at)
            : new Date(),
          updated_at: categoryData.updated_at
            ? new Date(categoryData.updated_at)
            : new Date(),
        });

        const savedCategory = await this.categoryRepository.save(category);
        categoryMap.set(categoryData.id, savedCategory);
        this.logger.debug(
          `   Saved category: ${savedCategory.name} (ID: ${savedCategory.id})`,
        );
      }

      // Second pass: Update parent relationships
      for (const categoryData of data) {
        if (categoryData.parent_id) {
          const category = categoryMap.get(categoryData.id);
          const parent = categoryMap.get(categoryData.parent_id);

          if (category && parent) {
            category.parent = parent;
            category.parent_id = parent.id;
            await this.categoryRepository.save(category);
            this.logger.debug(
              `   Updated parent for: ${category.name} -> ${parent.name}`,
            );
          }
        }
      }

      // TODO: Uncomment when Product module is developed
      // Update products count for categories with children
      // const categoriesWithChildren = await this.categoryRepository.find({
      //   relations: ['children', 'products'],
      // });
      //
      // for (const category of categoriesWithChildren) {
      //   if (category.children && category.children.length > 0) {
      //     let totalProducts = 0;
      //     for (const child of category.children) {
      //       const childWithProducts = await this.categoryRepository.findOne({
      //         where: { id: child.id },
      //         relations: ['products'],
      //       });
      //       totalProducts += childWithProducts?.products?.length || 0;
      //     }
      //     // You can store this in a separate table or calculate on the fly
      //   }
      // }

      this.logger.log(`✅ Categories seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed categories:', error.message);
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
    this.logger.log('🧹 Clearing categories data...');

    try {
      // Delete in correct order due to self-referencing foreign key
      await this.categoryRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
      await this.categoryRepository.clear();
      await this.categoryRepository.query('SET FOREIGN_KEY_CHECKS = 1;');

      this.logger.log('✅ Categories data cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear categories data:', error.message);
      throw error;
    }
  }
}
