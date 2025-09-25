import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Product } from './entities/product.entity';
import { Type } from '../types/entities/type.entity';
import { Shop } from '../shops/entites/shop.entity';
import { Tag } from '../tags/entities/tag.entity';
import { ShippingClass } from '../shippings/entities/shipping-class.entity';
import { GetProductsDto, ProductsPaginator, GetBestSellingProductsDto, GetPopularProductsDto } from './dto/get-products.dto';
import { generateSlug } from '../../utils/generate-slug';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import {ProductStatus, ProductType, QueryProductsOrderByColumn} from "../../common/enums/enums";
import {SortOrder} from "../common/dto/generic-conditions.dto";

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
            where: { slug }
        });
        if (slugExists) {
            throw new ConflictException('Product slug already exists');
        }

        // Get related entities
        const type = await this.typeRepository.findOne({
            where: { id: createProductDto.type_id } as any
        });
        if (!type) {
            throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
        }

        const shop = await this.shopRepository.findOne({
            where: { id: createProductDto.shop_id } as any
        });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
        }

        let shippingClass: ShippingClass | null = null;
        if (createProductDto.shipping_class_id) {
            shippingClass = await this.shippingClassRepository.findOne({
                where: { id: createProductDto.shipping_class_id } as any
            });
            if (!shippingClass) {
                throw new NotFoundException(`Shipping class with ID ${createProductDto.shipping_class_id} not found`);
            }
        }

        // Get tags if provided
        let tags: Tag[] = [];
        if (createProductDto.tag_ids && createProductDto.tag_ids.length > 0) {
            tags = await this.tagRepository.find({
                where: { id: In(createProductDto.tag_ids) } as any
            });
        }

        // Fix: Create product with proper DeepPartial type
        const product = this.productRepository.create({
            name: createProductDto.name,
            slug: slug,
            type: type,
            shop: shop,
            shipping_class: shippingClass || undefined, // Use undefined instead of null
            tags: tags,
            image: createProductDto.image,
            gallery: createProductDto.gallery,
            description: createProductDto.description,
            price: createProductDto.price,
            sale_price: createProductDto.sale_price,
            min_price: createProductDto.min_price || createProductDto.sale_price || createProductDto.price,
            max_price: createProductDto.max_price || createProductDto.sale_price || createProductDto.price,
            sku: createProductDto.sku,
            quantity: createProductDto.quantity || 0,
            in_stock: createProductDto.in_stock ?? true,
            is_taxable: createProductDto.is_taxable ?? true,
            status: createProductDto.status || ProductStatus.DRAFT,
            product_type: createProductDto.product_type || ProductType.SIMPLE,
            unit: createProductDto.unit,
            language: createProductDto.language || 'en',
            translated_languages: createProductDto.translated_languages || [],
            height: createProductDto.height,
            width: createProductDto.width,
            length: createProductDto.length,
        });

        const savedProduct = await this.productRepository.save(product);
        return savedProduct;
    }

    async getProductsPaginated({
                                   page = 1,
                                   limit = 30,
                                   search,
                                   language,
                                   shop_id,
                                   type_id,
                                   status,
                                   product_type,
                                   orderBy,
                                   sortedBy = SortOrder.DESC
                               }: GetProductsDto): Promise<ProductsPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const where: any = {};

        if (search) {
            where.name = Like(`%${search}%`);
        }

        if (language) {
            where.language = language;
        }

        if (shop_id) {
            where.shop = { id: parseInt(shop_id) } as any;
        }

        if (type_id) {
            where.type = { id: parseInt(type_id) } as any;
        }

        if (status) {
            where.status = status;
        }

        if (product_type) {
            where.product_type = product_type;
        }

        let order: any = { createdAt: 'DESC' };
        if (orderBy) {
            order = {};
            const column = this.getOrderByColumn(orderBy);
            order[column] = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
        }

        const [results, total] = await this.productRepository.findAndCount({
            where,
            relations: ['type', 'shop', 'shipping_class', 'tags'],
            take,
            skip,
            order,
        });

        const url = `/products?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
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
                return 'updatedAt';
            case QueryProductsOrderByColumn.CREATED_AT:
            default:
                return 'createdAt';
        }
    }

    async getProductBySlug(slug: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { slug },
            relations: ['type', 'shop', 'shipping_class', 'tags'],
        });

        if (!product) {
            throw new NotFoundException(`Product with slug ${slug} not found`);
        }

        return product;
    }

    async getProductById(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id } as any,
            relations: ['type', 'shop', 'shipping_class', 'tags'],
        });

        if (!product) {
            throw new ProductNotFoundException(id);
        }

        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.getProductById(id);

        if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
            const slugExists = await this.productRepository.findOne({
                where: { slug: updateProductDto.slug }
            });
            if (slugExists) {
                throw new ConflictException('Product slug already exists');
            }
        }

        // Update related entities if provided
        if (updateProductDto.type_id) {
            const type = await this.typeRepository.findOne({
                where: { id: updateProductDto.type_id } as any
            });
            if (!type) {
                throw new NotFoundException(`Type with ID ${updateProductDto.type_id} not found`);
            }
            product.type = type;
        }

        if (updateProductDto.shop_id) {
            const shop = await this.shopRepository.findOne({
                where: { id: updateProductDto.shop_id } as any
            });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${updateProductDto.shop_id} not found`);
            }
            product.shop = shop;
        }

        if (updateProductDto.shipping_class_id) {
            const shippingClass = await this.shippingClassRepository.findOne({
                where: { id: updateProductDto.shipping_class_id } as any
            });
            if (!shippingClass) {
                throw new NotFoundException(`Shipping class with ID ${updateProductDto.shipping_class_id} not found`);
            }
            product.shipping_class = shippingClass;
        }

        if (updateProductDto.tag_ids) {
            const tags = await this.tagRepository.find({
                where: { id: In(updateProductDto.tag_ids) } as any
            });
            product.tags = tags;
        }

        // Update other fields
        Object.assign(product, updateProductDto);

        // Recalculate min/max prices if price or sale_price changed
        if (updateProductDto.price !== undefined || updateProductDto.sale_price !== undefined) {
            const effectivePrice = updateProductDto.sale_price || updateProductDto.price || product.price;
            product.min_price = effectivePrice;
            product.max_price = effectivePrice;
        }

        return await this.productRepository.save(product);
    }

    async remove(id: number): Promise<void> {
        const product = await this.getProductById(id);
        await this.productRepository.remove(product);
    }

    async getBestSellingProducts({ limit = 10, shop_id, type_slug }: GetBestSellingProductsDto): Promise<Product[]> {
        const where: any = { status: ProductStatus.PUBLISH };

        if (shop_id) {
            where.shop = { id: shop_id } as any;
        }

        if (type_slug) {
            where.type = { slug: type_slug } as any;
        }

        return this.productRepository.find({
            where,
            relations: ['type', 'shop'],
            order: { quantity: 'DESC' },
            take: limit,
        });
    }

    async getPopularProducts({ limit = 10, shop_id, type_slug }: GetPopularProductsDto): Promise<Product[]> {
        const where: any = { status: ProductStatus.PUBLISH };

        if (shop_id) {
            where.shop = { id: shop_id } as any;
        }

        if (type_slug) {
            where.type = { slug: type_slug } as any;
        }

        return this.productRepository.find({
            where,
            relations: ['type', 'shop'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}