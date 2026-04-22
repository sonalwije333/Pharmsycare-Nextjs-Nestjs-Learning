// src/config/database/seeders/product-relations-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product, ProductType } from '../../../products/entities/product.entity';
import { Category } from '../../../categories/entities/category.entity';
import { Tag } from '../../../tags/entities/tag.entity';
import { AttributeValue } from '../../../attributes/entities/attribute-value.entity';

@Injectable()
export class ProductRelationsSeederService {
  private readonly logger = new Logger(ProductRelationsSeederService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async seedProductCategoryRelations(): Promise<void> {
    this.logger.log('🔗 Seeding product-category relations...');
    
    const products = await this.productRepository.find();
    const categories = await this.categoryRepository.find();
    
    if (categories.length === 0) {
      this.logger.warn('No categories found, skipping product-category relations');
      return;
    }
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Assign categories based on product type
      const matchingCategories = categories.filter(cat => {
        if (product.type?.slug === 'grocery') {
          return cat.slug === 'fruits-vegetables' || cat.slug === 'meat-fish';
        }
        if (product.type?.slug === 'makeup') {
          return cat.slug === 'face' || cat.slug === 'lips';
        }
        if (product.type?.slug === 'bags') {
          return cat.slug === 'handbags' || cat.slug === 'backpacks';
        }
        if (product.type?.slug === 'clothing') {
          return cat.slug === 'mens-clothing' || cat.slug === 'womens-clothing';
        }
        if (product.type?.slug === 'books') {
          return cat.slug === 'fiction' || cat.slug === 'non-fiction';
        }
        if (product.type?.slug === 'gadget') {
          return cat.slug === 'electronics' || cat.slug === 'accessories';
        }
        if (product.type?.slug === 'medicine') {
          return (
            cat.slug === 'baby-care' ||
            cat.slug === 'first-aid-kit' ||
            cat.slug === 'pregnancy' ||
            cat.slug === 'oral-mdc' ||
            cat.slug === 'beauty-care' ||
            cat.slug === 'sexual-wellbeing'
          );
        }
        return false;
      });
      
      if (matchingCategories.length > 0 && (!product.categories || product.categories.length === 0)) {
        product.categories = matchingCategories;
        await this.productRepository.save(product);
        updatedCount++;
      }
    }
    
    this.logger.log(`✅ Updated ${updatedCount} products with categories`);
  }
  
  async seedProductTagRelations(): Promise<void> {
    this.logger.log('🏷️ Seeding product-tag relations...');
    
    const products = await this.productRepository.find();
    const tags = await this.tagRepository.find();
    
    if (tags.length === 0) {
      this.logger.warn('No tags found, skipping product-tag relations');
      return;
    }
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Assign tags based on product name and type
      const productTags = tags.filter(tag => {
        const productName = product.name.toLowerCase();
        const tagName = tag.name.toLowerCase();
        
        if (productName.includes(tagName)) {
          return true;
        }
        
        if (product.type?.slug === 'grocery') {
          return tag.slug === 'fresh' || tag.slug === 'organic';
        }
        if (product.type?.slug === 'makeup') {
          return tag.slug === 'beauty' || tag.slug === 'cosmetics';
        }
        if (product.type?.slug === 'books') {
          return tag.slug === 'bestseller' || tag.slug === 'new-arrival';
        }
        if (product.type?.slug === 'gadget') {
          return tag.slug === 'tech' || tag.slug === 'new';
        }
        
        return false;
      }).slice(0, 3);
      
      if (productTags.length > 0 && (!product.tags || product.tags.length === 0)) {
        product.tags = productTags;
        await this.productRepository.save(product);
        updatedCount++;
      }
    }
    
    this.logger.log(`✅ Updated ${updatedCount} products with tags`);
  }
  
  async seedProductVariationRelations(): Promise<void> {
    this.logger.log('🎨 Seeding product variation relations...');
    
    const products = await this.productRepository.find({
      where: { product_type: ProductType.VARIABLE }
    });
    
    const attributeValues = await this.attributeValueRepository.find({
      relations: ['attribute']
    });
    
    if (attributeValues.length === 0) {
      this.logger.warn('No attribute values found, skipping product variation relations');
      return;
    }
    
    let updatedCount = 0;
    
    for (const product of products) {
      if (!product.variations || product.variations.length === 0) {
        // Assign variations based on product type
        let variations: AttributeValue[] = [];
        
        if (product.type?.slug === 'clothing') {
          // Size variations
          variations = attributeValues.filter(av => 
            av.attribute?.slug === 'size' || 
            av.value === 'S' || av.value === 'M' || av.value === 'L' || av.value === 'XL'
          );
        } else if (product.type?.slug === 'makeup') {
          // Color variations
          variations = attributeValues.filter(av => 
            av.attribute?.slug === 'color' || 
            av.value === 'Red' || av.value === 'Blue' || av.value === 'Black'
          );
        } else if (product.type?.slug === 'gadget') {
          // Storage variations
          variations = attributeValues.filter(av => 
            av.attribute?.slug === 'storage' || 
            av.value === '64GB' || av.value === '128GB' || av.value === '256GB'
          );
        }
        
        if (variations.length > 0) {
          product.variations = variations;
          await this.productRepository.save(product);
          updatedCount++;
        }
      }
    }
    
    this.logger.log(`✅ Updated ${updatedCount} variable products with variations`);
  }
  
  async seedAllRelations(): Promise<void> {
    await this.seedProductCategoryRelations();
    await this.seedProductTagRelations();
    await this.seedProductVariationRelations();
  }
}