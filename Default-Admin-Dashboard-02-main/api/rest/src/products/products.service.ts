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
import categoriesJson from '../db/pickbazar/categories.json';
import typesJson from '@db/types.json';
import popularProductsJson from '../db/pickbazar/popular-products.json';
import bestSellingProductsJson from '../db/pickbazar/best-selling-products.json';
import Fuse from 'fuse.js';

const products = plainToClass(Product, productsJson as object[]) as Product[];
const popularProducts = plainToClass(Product, popularProductsJson as object[]) as Product[];
const bestSellingProducts = plainToClass(Product, bestSellingProductsJson as object[]) as Product[];

const categorySlugById = new Map<string, string>();
const categoryTypeSlugByCategorySlug = new Map<string, string>();
const typeSlugById = new Map<string, string>();

const normalizeCategoryKey = (value?: string): string => {
  return (value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const registerCategorySlugs = (category: any, parentTypeSlug?: string): void => {
  if (!category) {
    return;
  }

  const currentTypeSlug = category?.type?.slug ?? parentTypeSlug;

  if (category.id !== undefined && category.id !== null && category.slug) {
    const categorySlug = String(category.slug);
    categorySlugById.set(String(category.id), categorySlug);
    if (currentTypeSlug) {
      categoryTypeSlugByCategorySlug.set(categorySlug, String(currentTypeSlug));
      categoryTypeSlugByCategorySlug.set(
        normalizeCategoryKey(categorySlug),
        String(currentTypeSlug),
      );
    }
  }

  if (Array.isArray(category.children)) {
    category.children.forEach((child: any) =>
      registerCategorySlugs(child, currentTypeSlug),
    );
  }
};

(categoriesJson as any[]).forEach((category) => registerCategorySlugs(category));

(typesJson as any[]).forEach((type) => {
  if (type?.id !== undefined && type?.id !== null && type?.slug) {
    typeSlugById.set(String(type.id), String(type.slug));
  }
});

const options: Fuse.IFuseOptions<Product> = {
  keys: [
    'name',
    'type.slug',
    'description',
    'sku',
    'status',
    'shop_id', 
    'categories.slug', 
    'tags', 
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

  private getProductShopId(product: Product): number | undefined {
    return (product as any).shop_id ?? product.shop?.id;
  }

  private getProductTypeSlug(product: Product): string | undefined {
    if (product.type?.slug) {
      return product.type.slug;
    }

    if (product.type_id !== undefined && product.type_id !== null) {
      return typeSlugById.get(String(product.type_id));
    }

    return undefined;
  }

  private normalizeCategorySlug(value?: string): string {
    return normalizeCategoryKey(value);
  }

  private getCategoryTypeSlug(categorySlug?: string): string | undefined {
    if (!categorySlug) {
      return undefined;
    }

    return (
      categoryTypeSlugByCategorySlug.get(categorySlug) ||
      categoryTypeSlugByCategorySlug.get(this.normalizeCategorySlug(categorySlug))
    );
  }

  private inferMedicineCategorySlug(product: Product): string[] {
    const haystack = [
      product.slug,
      product.name,
      product.sku,
      (product as any)?.image?.file_name,
      (product as any)?.image?.original,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!haystack) {
      return [];
    }

    if (/pregnan|prenatal|maternal|ovulation|fertility/.test(haystack)) {
      return ['pregnancy'];
    }

    if (/sexual|intimate|condom|libido/.test(haystack)) {
      return ['sexual-wellbeing'];
    }

    if (/wellness|immune|supplement|vitamin|protein|omega/.test(haystack)) {
      return ['health-and-wellness', 'health-&-wellness'];
    }

    if (/oral|tooth|gum|mouth/.test(haystack)) {
      return ['oral-mdc'];
    }

    if (/first-aid|bandage|gauze|antiseptic|pain-relief|painkiller/.test(haystack)) {
      return ['first-aid-kit'];
    }

    if (/baby|infant|newborn|formula|diaper/.test(haystack)) {
      return ['baby-care'];
    }

    return [];
  }

  private getCategorySlugs(product: Product): string[] {
    const rawCategories = (product as any).category ?? product.categories ?? [];
    const categories = (Array.isArray(rawCategories)
      ? rawCategories
      : [rawCategories]) as Array<any>;

    if (categories.length > 0) {
      return categories
        .map((category) => {
          if (typeof category === 'string') {
            return category;
          }

          if (typeof category === 'number') {
            return categorySlugById.get(String(category));
          }

          if (category?.slug) {
            return category.slug;
          }

          if (category?.id !== undefined && category?.id !== null) {
            return categorySlugById.get(String(category.id));
          }

          return undefined;
        })
        .filter(Boolean)
        .map((slug) => this.normalizeCategorySlug(slug));
    }

    if (product.type?.slug === 'medicine') {
      return this.inferMedicineCategorySlug(product).map((slug) =>
        this.normalizeCategorySlug(slug),
      );
    }

    return [];
  }

  private applyProductFilters(data: Product[], search?: string): Product[] {
    if (!search) {
      return data;
    }

    const parseSearchParams = search.split(';');
    const textSearchTerms: { [key: string]: any } = {};

    for (const searchParam of parseSearchParams) {
      const [key, value] = searchParam.split(':');

      if (!key || value === undefined) {
        continue;
      }

      if (key === 'name') {
        textSearchTerms.name = value;
      } else if (key === 'sku') {
        textSearchTerms.sku = value;
      } else if (key === 'type' || key === 'type_slug' || key === 'type.slug') {
        data = data.filter((product) => this.getProductTypeSlug(product) === value);
      } else if (key === 'categories' || key === 'categories.slug') {
        const normalizedValue = this.normalizeCategorySlug(value);
        const fallbackTypeSlug = this.getCategoryTypeSlug(value);
        data = data.filter((product) => {
          const categorySlugs = this.getCategorySlugs(product);
          if (categorySlugs.includes(normalizedValue)) {
            return true;
          }

          // Fallback for seed data where products don't include category relations.
          if (categorySlugs.length === 0 && fallbackTypeSlug) {
            return this.getProductTypeSlug(product) === fallbackTypeSlug;
          }

          return false;
        });
      } else if (key === 'status') {
        data = data.filter((product) => product.status === value);
      } else if (key === 'product_type') {
        data = data.filter((product) => product.product_type === value);
      }
    }

    if (Object.keys(textSearchTerms).length > 0) {
      const filteredFuse = new Fuse(data, options);
      const results = filteredFuse.search({
        $and: Object.entries(textSearchTerms).map(([key, value]) => ({
          [key]: value,
        })),
      });

      return results.map((result) => result.item);
    }

    return data;
  }

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
      shop: null, 
      type: null, 
    } as unknown as Product;
    
    this.products.push(newProduct);
    return newProduct;
  }

  getProducts({ limit, page, search, type_slug, status, product_type, language, shop_id }: GetProductsDto): ProductPaginator {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: Product[] = [...this.products];

    // Filter by type_slug
    if (type_slug) {
      data = data.filter((product) => this.getProductTypeSlug(product) === type_slug);
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

    if (shop_id) {
      data = data.filter((product) => this.getProductShopId(product) === shop_id);
    }

    data = this.applyProductFilters(data, search);

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
      data = data.filter((product) => this.getProductTypeSlug(product) === type_slug);
    }
    
    return data.slice(0, limit);
  }

  getBestSellingProducts({ limit, type_slug }: GetBestSellingProductsDto): Product[] {
    let data: Product[] = [...this.bestSellingProducts];
    
    if (type_slug) {
      data = data.filter((product) => this.getProductTypeSlug(product) === type_slug);
    }
    
    return data.slice(0, limit);
  }

  getProductsStock({ limit, page, search, type_slug, product_type, shop_id }: GetProductsDto): ProductPaginator {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: Product[] = this.products.filter((item) => item.quantity <= 9 && item.in_stock !== 0);

    // Filter by type_slug
    if (type_slug) {
      data = data.filter((product) => product.type?.slug === type_slug);
    }

    // Filter by product_type
    if (product_type) {
      data = data.filter((product) => product.product_type === product_type);
    }

    if (shop_id) {
      data = data.filter((product) => this.getProductShopId(product) === shop_id);
    }

    data = this.applyProductFilters(data, search).filter(
      (item) => item.quantity <= 9,
    );

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    const url = `/products-stock?search=${search || ''}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getDraftProducts({ limit, page, search, type_slug, product_type, shop_id }: GetProductsDto): ProductPaginator {
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

    if (shop_id) {
      data = data.filter((product) => this.getProductShopId(product) === shop_id);
    }

    data = this.applyProductFilters(data, search).filter(
      (item) => item.status === ProductStatus.DRAFT,
    );

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