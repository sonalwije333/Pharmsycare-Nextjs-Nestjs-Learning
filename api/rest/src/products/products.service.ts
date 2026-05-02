// products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { GetBestSellingProductsDto } from './dto/get-best-selling-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStatus } from './entities/product.entity';
import { paginate } from '../common/pagination/paginate';
import productsJson from '../db/pickbazar/products.json';
import popularProductsJson from '../db/pickbazar/popular-products.json';
import bestSellingProductsJson from '../db/pickbazar/best-selling-products.json';
import Fuse from 'fuse.js';

const products = plainToClass(Product, productsJson as object[]) as Product[];
const popularProducts = plainToClass(Product, popularProductsJson as object[]) as Product[];
const bestSellingProducts = plainToClass(Product, bestSellingProductsJson as object[]) as Product[];

const options: Fuse.IFuseOptions<Product> = {
  keys: [
    'name',
    'type.slug',
    'description',
    'sku',
    'status',
    // 'shop_id', // Commented for future use
    // 'categories.slug', // Commented for future use
    // 'tags', // Commented for future use
  ],
  threshold: 0.3,
  includeScore: true,
};

const fuse = new Fuse(products, options);

@Injectable()
export class ProductsService {
  private products: Product[] = products;
  private popularProducts: Product[] = popularProducts;
  private bestSellingProducts: Product[] = bestSellingProducts;

  create(createProductDto: CreateProductDto): Product {
    const newProduct: Product = {
      ...createProductDto,
      id: this.products.length + 1,
      slug: createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date(),
      updated_at: new Date(),
      status: createProductDto.status || ProductStatus.DRAFT,
      in_stock: createProductDto.in_stock ?? 1,
      is_taxable: createProductDto.is_taxable ?? 0,
      in_flash_sale: createProductDto.in_flash_sale ?? 0,
      is_digital: createProductDto.is_digital ?? 0,
      is_external: createProductDto.is_external ?? 0,
      sold_quantity: 0,
      ratings: 0,
      total_reviews: 0,
      rating_count: [],
      in_wishlist: false,
      translated_languages: [createProductDto.language || 'en'],
      // shop: null, // Commented for future use
      // type: null, // Will be populated from DB
    } as unknown as Product;
    
    this.products.push(newProduct);
    return newProduct;
  }

  getProducts({ limit, page, search, type_slug, status, product_type, language }: GetProductsDto): ProductPaginator {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: Product[] = [...this.products];

    // Filter by type_slug
    if (type_slug) {
      data = data.filter((product) => product.type?.slug === type_slug);
    }

    // Filter by status
    if (status) {
      data = data.filter((product) => product.status === status);
    }

    // Filter by product_type
    if (product_type) {
      data = data.filter((product) => product.product_type === product_type);
    }

    // Filter by language
    if (language) {
      data = data.filter((product) => product.language === language);
    }

    // Filter by shop_id (commented for future use)
    // if (shop_id) {
    //   data = data.filter((product) => product.shop_id === shop_id);
    // }

    // Search functionality
    if (search) {
      const parseSearchParams = search.split(';');
      const searchTerms: { [key: string]: any } = {};
      
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'name') {
          searchTerms.name = value;
        } else if (key === 'sku') {
          searchTerms.sku = value;
        }
      }

      if (Object.keys(searchTerms).length > 0) {
        const results = fuse.search({
          $and: Object.entries(searchTerms).map(([key, value]) => ({ [key]: value })),
        });
        data = results.map((result) => result.item);
      } else {
        const results = fuse.search(search);
        data = results.map((result) => result.item);
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/products?search=${search || ''}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getProductBySlug(slug: string): Product {
    const product = this.products.find((p) => p.slug === slug);
    
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    
    // Get related products by type
    const related_products = this.products
      .filter((p) => p.type_id === product.type_id && p.id !== product.id)
      .slice(0, 20);
    
    return {
      ...product,
      related_products,
    };
  }

  getPopularProducts({ limit, type_slug }: GetPopularProductsDto): Product[] {
    let data: Product[] = [...this.popularProducts];
    
    if (type_slug) {
      data = data.filter((product) => product.type?.slug === type_slug);
    }
    
    // Filter by shop_id (commented for future use)
    // if (shop_id) {
    //   data = data.filter((product) => product.shop_id === shop_id);
    // }
    
    return data.slice(0, limit);
  }

  getBestSellingProducts({ limit, type_slug }: GetBestSellingProductsDto): Product[] {
    let data: Product[] = [...this.bestSellingProducts];
    
    if (type_slug) {
      data = data.filter((product) => product.type?.slug === type_slug);
    }
    
    // Filter by shop_id (commented for future use)
    // if (shop_id) {
    //   data = data.filter((product) => product.shop_id === shop_id);
    // }
    
    return data.slice(0, limit);
  }

  getProductsStock({ limit, page, search, type_slug, product_type }: GetProductsDto): ProductPaginator {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: Product[] = this.products.filter((item) => item.quantity <= 9 && item.in_stock === 1);

    // Filter by type_slug
    if (type_slug) {
      data = data.filter((product) => product.type?.slug === type_slug);
    }

    // Filter by product_type
    if (product_type) {
      data = data.filter((product) => product.product_type === product_type);
    }

    // Search functionality
    if (search) {
      const parseSearchParams = search.split(';');
      const searchTerms: { [key: string]: any } = {};
      
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'name') {
          searchTerms.name = value;
        } else if (key === 'sku') {
          searchTerms.sku = value;
        }
      }

      if (Object.keys(searchTerms).length > 0) {
        const results = fuse.search({
          $and: Object.entries(searchTerms).map(([key, value]) => ({ [key]: value })),
        });
        data = results.map((result) => result.item).filter((item) => item.quantity <= 9);
      } else {
        const results = fuse.search(search);
        data = results.map((result) => result.item).filter((item) => item.quantity <= 9);
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/products-stock?search=${search || ''}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getDraftProducts({ limit, page, search, type_slug, product_type }: GetProductsDto): ProductPaginator {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: Product[] = this.products.filter((item) => item.status === ProductStatus.DRAFT);

    // Filter by type_slug
    if (type_slug) {
      data = data.filter((product) => product.type?.slug === type_slug);
    }

    // Filter by product_type
    if (product_type) {
      data = data.filter((product) => product.product_type === product_type);
    }

    // Search functionality
    if (search) {
      const parseSearchParams = search.split(';');
      const searchTerms: { [key: string]: any } = {};
      
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'name') {
          searchTerms.name = value;
        } else if (key === 'sku') {
          searchTerms.sku = value;
        }
      }

      if (Object.keys(searchTerms).length > 0) {
        const results = fuse.search({
          $and: Object.entries(searchTerms).map(([key, value]) => ({ [key]: value })),
        });
        data = results.map((result) => result.item).filter((item) => item.status === ProductStatus.DRAFT);
      } else {
        const results = fuse.search(search);
        data = results.map((result) => result.item).filter((item) => item.status === ProductStatus.DRAFT);
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/draft-products?search=${search || ''}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  update(id: number, updateProductDto: UpdateProductDto): Product {
    const productIndex = this.products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    
    const updatedProduct = {
      ...this.products[productIndex],
      ...updateProductDto,
      updated_at: new Date(),
    } as unknown as Product;
    
    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  remove(id: number): { message: string } {
    const productIndex = this.products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    
    this.products.splice(productIndex, 1);
    return { message: `Product #${id} has been successfully removed` };
  }
}