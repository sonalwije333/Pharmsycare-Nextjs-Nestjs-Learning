import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Product } from './entities/product.entity';
import { Type } from '../types/entities/type.entity';
import { Shop } from '../shops/entites/shop.entity';
import { Tag } from '../tags/entities/tag.entity';
import { ShippingClass } from '../shippings/entities/shipping-class.entity';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { GetBestSellingProductsDto } from './dto/get-best-selling-products.dto';
import { generateSlug } from '../../utils/generate-slug';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import {
  ProductStatus,
  QueryProductsOrderByColumn,
} from '../../common/enums/enums';
import { SortOrder } from '../common/dto/generic-conditions.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ShippingClass)
    private readonly shippingClassRepository: Repository<ShippingClass>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slug = createProductDto.slug || generateSlug(createProductDto.name);

    // Check if slug already exists
    const slugExists = await this.productRepository.findOne({
      where: { slug },
    });
    if (slugExists) {
      throw new ConflictException('Product slug already exists');
    }

    // Get related entities
    const type = await this.typeRepository.findOne({
      where: { id: Number(createProductDto.type_id) },
    });
    if (!type) {
      throw new NotFoundException(
        `Type with ID ${createProductDto.type_id} not found`,
      );
    }

    const shop = await this.shopRepository.findOne({
      where: { id: createProductDto.shop_id },
    });
    if (!shop) {
      throw new NotFoundException(
        `Shop with ID ${createProductDto.shop_id} not found`,
      );
    }

    let shippingClass: ShippingClass | null = null;
    if (createProductDto.shipping_class_id) {
      shippingClass = await this.shippingClassRepository.findOne({
        where: { id: createProductDto.shipping_class_id },
      });
      if (!shippingClass) {
        throw new NotFoundException(
          `Shipping class with ID ${createProductDto.shipping_class_id} not found`,
        );
      }
    }

    // Get tags if provided
    let tags: Tag[] = [];
    if (createProductDto.tag_ids && createProductDto.tag_ids.length > 0) {
      tags = await this.tagRepository.find({
        where: { id: In(createProductDto.tag_ids) },
      });
    }

    const product = this.productRepository.create({
      name: createProductDto.name,
      slug: slug,
      type: type,
      shop: shop,
      shipping_class: shippingClass || undefined,
      tags: tags,
      image: createProductDto.image,
      gallery: createProductDto.gallery,
      description: createProductDto.description,
      price: createProductDto.price,
      sale_price: createProductDto.sale_price,
      min_price:
        createProductDto.min_price ||
        createProductDto.sale_price ||
        createProductDto.price,
      max_price:
        createProductDto.max_price ||
        createProductDto.sale_price ||
        createProductDto.price,
      sku: createProductDto.sku,
      quantity: createProductDto.quantity || 0,
      in_stock: createProductDto.in_stock ?? true,
      is_taxable: createProductDto.is_taxable ?? true,
      status: createProductDto.status || ProductStatus.DRAFT,
      product_type: createProductDto.product_type,
      unit: createProductDto.unit,
      language: createProductDto.language || 'en',
      translated_languages: createProductDto.translated_languages || [],
      height: createProductDto.height,
      width: createProductDto.width,
      length: createProductDto.length,
      views: 0,
      sold_quantity: 0,
    });

    const savedProduct = await this.productRepository.save(product);
    return savedProduct;
  }

  async getProducts({
    page = 1,
    limit = 30,
    search,
    language,
    shop_id,
    type_id,
    status,
    product_type,
    orderBy = QueryProductsOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetProductsDto): Promise<ProductPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.shipping_class', 'shipping_class')
      .leftJoinAndSelect('product.tags', 'tags');

    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (language) {
      queryBuilder.andWhere('product.language = :language', { language });
    }

    if (shop_id) {
      queryBuilder.andWhere('shop.id = :shop_id', {
        shop_id: shop_id as any,
      });
    }

    if (type_id) {
      queryBuilder.andWhere('type.id = :type_id', {
        type_id: type_id,
      });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (product_type) {
      queryBuilder.andWhere('product.product_type = :product_type', {
        product_type,
      });
    }

    // Apply ordering
    const orderField = this.getOrderByColumn(orderBy);
    queryBuilder.orderBy(
      `product.${orderField}`,
      sortedBy === SortOrder.ASC ? 'ASC' : 'DESC',
    );

    const [results, total] = await queryBuilder
      .take(take)
      .skip(skip)
      .getManyAndCount();

    const url = `/products?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getPopularProducts({
    limit = 10,
    shop_id,
    type_slug,
  }: GetPopularProductsDto): Promise<Product[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.status = :status', { status: ProductStatus.PUBLISH });

    if (shop_id) {
      queryBuilder.andWhere('shop.id = :shop_id', { shop_id });
    }

    if (type_slug) {
      queryBuilder.andWhere('type.slug = :type_slug', { type_slug });
    }

    return queryBuilder
      .orderBy('product.views', 'DESC')
      .addOrderBy('product.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async getBestSellingProducts({
    limit = 10,
    shop_id,
    type_slug,
  }: GetBestSellingProductsDto): Promise<Product[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.status = :status', { status: ProductStatus.PUBLISH });

    if (shop_id) {
      queryBuilder.andWhere('shop.id = :shop_id', { shop_id });
    }

    if (type_slug) {
      queryBuilder.andWhere('type.slug = :type_slug', { type_slug });
    }

    return queryBuilder
      .orderBy('product.sold_quantity', 'DESC')
      .take(limit)
      .getMany();
  }

  async getDraftProducts({
    page = 1,
    limit = 30,
    search,
    shop_id,
  }: GetProductsDto): Promise<ProductPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.status = :status', { status: ProductStatus.DRAFT });

    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (shop_id) {
      queryBuilder.andWhere('shop.id = :shop_id', {
        shop_id: shop_id as any,
      });
    }

    const [results, total] = await queryBuilder
      .take(take)
      .skip(skip)
      .orderBy('product.created_at', 'DESC')
      .getManyAndCount();

    const url = `/draft-products?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getProductsStock({
    page = 1,
    limit = 30,
    search,
    shop_id,
  }: GetProductsDto): Promise<ProductPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.quantity <= :threshold', { threshold: 10 });

    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (shop_id) {
      queryBuilder.andWhere('shop.id = :shop_id', {
        shop_id: shop_id as any,
      });
    }

    const [results, total] = await queryBuilder
      .take(take)
      .skip(skip)
      .orderBy('product.quantity', 'ASC')
      .getManyAndCount();

    const url = `/products-stock?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['type', 'shop', 'shipping_class', 'tags'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Increment views
    product.views += 1;
    await this.productRepository.save(product);

    return product;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['type', 'shop', 'shipping_class', 'tags'],
    });

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const slugExists = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
      });
      if (slugExists) {
        throw new ConflictException('Product slug already exists');
      }
    }

    // Update related entities if provided
    if (updateProductDto.type_id) {
      const type = await this.typeRepository.findOne({
        where: { id: Number(updateProductDto.type_id) },
      });
      if (!type) {
        throw new NotFoundException(
          `Type with ID ${updateProductDto.type_id} not found`,
        );
      }
      product.type = type;
    }

    if (updateProductDto.shop_id) {
      const shop = await this.shopRepository.findOne({
        where: { id: updateProductDto.shop_id },
      });
      if (!shop) {
        throw new NotFoundException(
          `Shop with ID ${updateProductDto.shop_id} not found`,
        );
      }
      product.shop = shop;
    }

    if (updateProductDto.shipping_class_id) {
      const shippingClass = await this.shippingClassRepository.findOne({
        where: { id: updateProductDto.shipping_class_id },
      });
      if (!shippingClass) {
        throw new NotFoundException(
          `Shipping class with ID ${updateProductDto.shipping_class_id} not found`,
        );
      }
      product.shipping_class = shippingClass;
    }

    if (updateProductDto.tag_ids) {
      const tags = await this.tagRepository.find({
        where: { id: In(updateProductDto.tag_ids) },
      });
      product.tags = tags;
    }

    // Update other fields
    Object.assign(product, updateProductDto);

    // Recalculate min/max prices if price or sale_price changed
    if (
      updateProductDto.price !== undefined ||
      updateProductDto.sale_price !== undefined
    ) {
      const effectivePrice =
        updateProductDto.sale_price || updateProductDto.price || product.price;
      product.min_price = effectivePrice;
      product.max_price = effectivePrice;
    }

    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
  }

  private getOrderByColumn(orderBy: QueryProductsOrderByColumn): string {
    switch (orderBy) {
      case QueryProductsOrderByColumn.NAME:
        return 'name';
      case QueryProductsOrderByColumn.PRICE:
        return 'price';
      case QueryProductsOrderByColumn.SALE_PRICE:
        return 'sale_price';
      case QueryProductsOrderByColumn.STATUS:
        return 'status';
      case QueryProductsOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryProductsOrderByColumn.CREATED_AT:
      default:
        return 'created_at';
    }
  }
}
