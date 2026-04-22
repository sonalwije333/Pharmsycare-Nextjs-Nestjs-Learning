// src/config/database/seeders/product-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Product, ProductStatus, ProductType, Type as ProductTypeEntity } from '../../../products/entities/product.entity';
import { Category } from '../../../categories/entities/category.entity';
import { Type as TypeEntity } from '../../../types/entities/type.entity';
import { Tag } from '../../../tags/entities/tag.entity';
import { Shop } from '../../../shops/entities/shop.entity';
import { Author } from '../../../authors/entities/author.entity';
import { Manufacturer } from '../../../manufacturers/entities/manufacturer.entity';
import { AttributeValue } from '../../../attributes/entities/attribute-value.entity';
import productsJson from '../../../db/pickbazar/products.json';
import popularProductsJson from '../../../db/pickbazar/popular-products.json';
import bestSellingProductsJson from '../../../db/pickbazar/best-selling-products.json';

@Injectable()
export class ProductSeederService {
  private readonly logger = new Logger(ProductSeederService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(TypeEntity)
    private readonly typeRepository: Repository<TypeEntity>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Seeding products...');
    
    try {
      // Clear existing products
      await this.clear();
      
      // Get related entities for mapping
      const categories = await this.categoryRepository.find();
      const types = await this.typeRepository.find();
      const tags = await this.tagRepository.find();
      const shops = await this.shopRepository.find();
      const authors = await this.authorRepository.find();
      const manufacturers = await this.manufacturerRepository.find();
      const attributeValues = await this.attributeValueRepository.find();
      
      // Create category and type lookup maps
      const categoryMap = new Map<number, Category>();
      const typeMap = new Map<number | string, TypeEntity>();
      const tagMap = new Map<number, Tag>();
      const shopMap = new Map<number, Shop>();
      const authorMap = new Map<number, Author>();
      const manufacturerMap = new Map<number, Manufacturer>();
      const attributeValueMap = new Map<number, AttributeValue>();
      
      categories.forEach(cat => categoryMap.set(cat.id, cat));
      types.forEach(type => typeMap.set(type.id, type));
      types.forEach(type => typeMap.set(type.slug, type));
      tags.forEach(tag => tagMap.set(tag.id, tag));
      shops.forEach(shop => shopMap.set(shop.id, shop));
      authors.forEach(author => authorMap.set(author.id, author));
      manufacturers.forEach(man => manufacturerMap.set(man.id, man));
      attributeValues.forEach(av => attributeValueMap.set(av.id, av));
      
      // Seed main products
      const products = plainToClass(Product, productsJson as object[]);
      const savedProducts: Product[] = [];
      
      for (const product of products) {
        const newProduct = this.mapProductEntity(
          product, 
          categoryMap, 
          typeMap, 
          tagMap, 
          shopMap, 
          authorMap, 
          manufacturerMap,
          attributeValueMap
        );
        const saved = await this.productRepository.save(newProduct);
        savedProducts.push(saved);
      }
      
      this.logger.log(`✅ Seeded ${savedProducts.length} products`);
      
      // Seed popular products
      await this.seedPopularProducts(popularProductsJson, savedProducts);
      
      // Seed best selling products
      await this.seedBestSellingProducts(bestSellingProductsJson, savedProducts);
      
      // Seed draft products
      await this.seedDraftProducts(savedProducts);
      
      // Seed low stock products
      await this.seedLowStockProducts(savedProducts);
      
    } catch (error) {
      this.logger.error(`❌ Failed to seed products: ${error.message}`);
      throw error;
    }
  }
  
  private mapProductEntity(
    product: any,
    categoryMap: Map<number, Category>,
    typeMap: Map<number | string, TypeEntity>,
    tagMap: Map<number, Tag>,
    shopMap: Map<number, Shop>,
    authorMap: Map<number, Author>,
    manufacturerMap: Map<number, Manufacturer>,
    attributeValueMap: Map<number, AttributeValue>
  ): Partial<Product> {
    const productEntity: Partial<Product> = {
      name: product.name,
      slug: product.slug,
      description: product.description || null,
      type_id: product.type?.id || product.type_id,
      type: this.toProductType(typeMap.get(product.type?.id) || typeMap.get(product.type?.slug)),
      price: product.price,
      sale_price: product.sale_price,
      language: product.language || 'en',
      min_price: product.min_price,
      max_price: product.max_price,
      sku: product.sku,
      quantity: product.quantity,
      sold_quantity: product.sold_quantity || 0,
      in_stock: product.in_stock ?? 1,
      is_taxable: product.is_taxable ?? 0,
      in_flash_sale: product.in_flash_sale ?? 0,
      status: product.status || ProductStatus.PUBLISH,
      product_type: product.product_type || ProductType.SIMPLE,
      unit: product.unit,
      height: product.height,
      width: product.width,
      length: product.length,
      image: product.image,
      video: product.video || [],
      gallery: product.gallery || [],
      is_digital: product.is_digital ?? 0,
      is_external: product.is_external ?? 0,
      external_product_url: product.external_product_url,
      external_product_button_text: product.external_product_button_text,
      visibility: product.visibility,
      created_at: product.created_at ? new Date(product.created_at) : new Date(),
      updated_at: product.updated_at ? new Date(product.updated_at) : new Date(),
      translated_languages: product.translated_languages || ['en'],
      ratings: product.ratings || 0,
      total_reviews: product.total_reviews || 0,
      rating_count: product.rating_count || [],
    };
    
    // Set author
    if (product.author_id) {
      productEntity.author_id = product.author_id;
    }
    
    // Set manufacturer
    if (product.manufacturer_id) {
      productEntity.manufacturer_id = product.manufacturer_id;
    }
    
    // Set categories
    if (product.categories && Array.isArray(product.categories)) {
      productEntity.categories = product.categories
        .map((cat: any) => categoryMap.get(cat.id))
        .filter(Boolean);
    }
    
    // Set tags
    if (product.tags && Array.isArray(product.tags)) {
      productEntity.tags = product.tags
        .map((tag: any) => tagMap.get(tag.id))
        .filter(Boolean);
    }
    
    // Set variations
    if (product.variations && Array.isArray(product.variations)) {
      productEntity.variations = product.variations
        .map((varId: number) => attributeValueMap.get(varId))
        .filter(Boolean);
    }
    
    return productEntity;
  }

  private toProductType(type?: TypeEntity): ProductTypeEntity | undefined {
    if (!type) {
      return undefined;
    }

    return {
      ...type,
      created_at: type.created_at?.toISOString(),
      updated_at: type.updated_at?.toISOString(),
    };
  }
  
  private async seedPopularProducts(popularData: any[], allProducts: Product[]): Promise<void> {
    this.logger.log('🌟 Seeding popular products...');
    
    const productMap = new Map<number, Product>();
    allProducts.forEach(p => productMap.set(p.id, p));
    
    let count = 0;
    for (const popularProduct of popularData) {
      const product = productMap.get(popularProduct.id);
      if (product) {
        // Mark as popular (you might have a separate table or flag)
        // For now, we'll just ensure it's published
        if (product.status !== ProductStatus.PUBLISH) {
          product.status = ProductStatus.PUBLISH;
          await this.productRepository.save(product);
          count++;
        }
      }
    }
    
    this.logger.log(`✅ Seeded ${count} popular products`);
  }
  
  private async seedBestSellingProducts(bestSellingData: any[], allProducts: Product[]): Promise<void> {
    this.logger.log('🏆 Seeding best selling products...');
    
    const productMap = new Map<number, Product>();
    allProducts.forEach(p => productMap.set(p.id, p));
    
    let count = 0;
    for (const bestSeller of bestSellingData) {
      const product = productMap.get(bestSeller.id);
      if (product) {
        // Update sold quantity to make it appear as best seller
        if (product.sold_quantity === 0) {
          product.sold_quantity = Math.floor(Math.random() * 100) + 50;
          await this.productRepository.save(product);
          count++;
        }
      }
    }
    
    this.logger.log(`✅ Seeded ${count} best selling products`);
  }
  
  private async seedDraftProducts(allProducts: Product[]): Promise<void> {
    this.logger.log('📝 Creating draft products...');
    
    const draftProducts = allProducts.filter(p => p.status === ProductStatus.DRAFT);
    
    if (draftProducts.length === 0 && allProducts.length > 0) {
      // Create some draft products from existing ones
      const productsToMakeDraft = allProducts.slice(0, Math.min(10, allProducts.length));
      for (const product of productsToMakeDraft) {
        product.status = ProductStatus.DRAFT;
        await this.productRepository.save(product);
      }
      this.logger.log(`✅ Created ${productsToMakeDraft.length} draft products`);
    } else {
      this.logger.log(`✅ Found ${draftProducts.length} draft products`);
    }
  }
  
  private async seedLowStockProducts(allProducts: Product[]): Promise<void> {
    this.logger.log('⚠️ Creating low stock products...');
    
    let count = 0;
    for (const product of allProducts) {
      if (product.quantity <= 9 && product.in_stock === 1) {
        count++;
      } else if (product.quantity > 9 && count < 15) {
        // Reduce quantity for some products to create low stock
        product.quantity = Math.floor(Math.random() * 9) + 1;
        await this.productRepository.save(product);
        count++;
      }
    }
    
    this.logger.log(`✅ Seeded ${count} low stock products`);
  }
  
  async seedSpecific(productType: string): Promise<void> {
    this.logger.log(`🌱 Seeding specific product type: ${productType}`);
    
    const types = await this.typeRepository.find();
    const typeMap = new Map<string, TypeEntity>();
    types.forEach(type => typeMap.set(type.slug, type));
    
    switch (productType) {
      case 'grocery':
        await this.seedProductsByType(typeMap.get('grocery'));
        break;
      case 'makeup':
        await this.seedProductsByType(typeMap.get('makeup'));
        break;
      case 'bags':
        await this.seedProductsByType(typeMap.get('bags'));
        break;
      case 'clothing':
        await this.seedProductsByType(typeMap.get('clothing'));
        break;
      case 'furniture':
        await this.seedProductsByType(typeMap.get('furniture'));
        break;
      case 'books':
        await this.seedProductsByType(typeMap.get('books'));
        break;
      case 'gadget':
        await this.seedProductsByType(typeMap.get('gadget'));
        break;
      case 'medicine':
        await this.seedProductsByType(typeMap.get('medicine'));
        break;
      default:
        this.logger.warn(`Unknown product type: ${productType}`);
    }
  }
  
  private async seedProductsByType(type: TypeEntity | undefined): Promise<void> {
    if (!type) {
      this.logger.warn('Type not found');
      return;
    }
    
    const products = plainToClass(Product, productsJson as object[]);
    const filteredProducts = products.filter(p => p.type?.slug === type.slug);
    
    let savedCount = 0;
    for (const product of filteredProducts) {
      const existing = await this.productRepository.findOne({
        where: { slug: product.slug }
      });
      
      if (!existing) {
        const newProduct = this.productRepository.create({
          ...product,
          type_id: type.id,
          type: this.toProductType(type),
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.productRepository.save(newProduct);
        savedCount++;
      }
    }
    
    this.logger.log(`✅ Seeded ${savedCount} products for type: ${type.name}`);
  }
  
  async seedByShopId(shopId: number): Promise<void> {
    this.logger.log(`🌱 Seeding products for shop ID: ${shopId}`);
    
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      this.logger.warn(`Shop with ID ${shopId} not found`);
      return;
    }
    
    const products = plainToClass(Product, productsJson as object[]);
    const shopProducts = (products as any[]).filter(
      p => p.shop?.id === shopId || p.shop_id === shopId,
    ) as Product[];
    
    let savedCount = 0;
    for (const product of shopProducts) {
      const existing = await this.productRepository.findOne({
        where: { slug: `${product.slug}-${shopId}` }
      });
      
      if (!existing) {
        const newProduct = this.productRepository.create({
          ...product,
          slug: `${product.slug}-${shopId}`,
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.productRepository.save(newProduct);
        savedCount++;
      }
    }
    
    this.logger.log(`✅ Seeded ${savedCount} products for shop: ${shop.name}`);
  }
  
  async seedByCategoryId(categoryId: number): Promise<void> {
    this.logger.log(`🌱 Seeding products for category ID: ${categoryId}`);
    
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['products']
    });
    
    if (!category) {
      this.logger.warn(`Category with ID ${categoryId} not found`);
      return;
    }
    
    const products = plainToClass(Product, productsJson as object[]);
    const categoryProducts = products.filter(p => 
      p.categories?.some(cat => cat.id === categoryId)
    );
    
    let savedCount = 0;
    for (const product of categoryProducts) {
      const existing = await this.productRepository.findOne({
        where: { slug: product.slug }
      });
      
      if (!existing) {
        const newProduct = this.productRepository.create({
          ...product,
          categories: [category],
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.productRepository.save(newProduct);
        savedCount++;
      }
    }
    
    this.logger.log(`✅ Seeded ${savedCount} products for category: ${category.name}`);
  }
  
  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing products...');
    
    try {
      // Delete in correct order to respect foreign key constraints
      await this.productRepository.query('SET FOREIGN_KEY_CHECKS = 0');
      await this.productRepository.clear();
      await this.productRepository.query('SET FOREIGN_KEY_CHECKS = 1');
      this.logger.log('✅ Products cleared successfully');
    } catch (error) {
      this.logger.error(`Failed to clear products: ${error.message}`);
      throw error;
    }
  }
  
  async clearSpecific(productType: string): Promise<void> {
    this.logger.log(`🧹 Clearing specific product type: ${productType}`);
    
    const types = await this.typeRepository.find();
    const type = types.find(t => t.slug === productType);
    
    if (type) {
      await this.productRepository.delete({ type_id: type.id });
      this.logger.log(`✅ Cleared products for type: ${productType}`);
    } else {
      this.logger.warn(`Type not found: ${productType}`);
    }
  }
}