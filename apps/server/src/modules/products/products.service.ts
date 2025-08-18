import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Product } from './entities/product.entity';
import { GetProductsDto, ProductsPaginator } from './dto/get-products.dto';
import { generateSlug } from 'src/utils/generate-slug';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { Type } from '../types/entities/type.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProductsPaginated({
    limit = 30,
    page = 1,
    search,
  }: GetProductsDto): Promise<ProductsPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where = search
      ? [{ name: Like(`%${search}%`) }, { slug: Like(`%${search}%`) }]
      : {};

    const [results, total] = await this.productRepository.findAndCount({
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    const url = `/products?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getProductBySlug(slug: string): Promise<Product> {
    console.log('getCatbySlug');
    const category = await this.productRepository.findOne({
      where: { slug },
      // relations: ['image', 'banners', 'promotional_sliders'], // optional
    });
    if (!category) {
      throw new NotFoundException(`Type with slug ${slug} not found`);
    }
    return category;
  }

  async create(createProductDto: CreateProductDto) {
    const slug = createProductDto.slug || generateSlug(createProductDto.name);

    const type = await this.typeRepository.findOneBy({
      id: createProductDto.type_id,
    });

    if (!type) {
      throw new NotFoundException(
        `Type with id ${createProductDto.type_id} not found`,
      );
    }

    const product = this.productRepository.create({
      // name: createProductDto.name
      name: createProductDto.name,
      slug: slug,
      type: type,
      image: createProductDto.image,
      gallery: createProductDto.gallery,
      description: createProductDto.description,
      price: createProductDto.price,
      sale_price: createProductDto.sale_price,
      min_price: createProductDto.min_price,
      max_price: createProductDto.max_price,
      sku: createProductDto.sku,
      quantity: createProductDto.quantity,
      in_stock: createProductDto.in_stock,
      is_taxable: createProductDto.is_taxable,
      product_type: createProductDto.product_type,
      unit: createProductDto.unit,
    });

    await this.productRepository.save(product);
  }

  // async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
  //   const product = await this.productRepository.findOneBy({ id });

  //   if (!product) {
  //     throw new ProductNotFoundException(id);
  //   }

  //   // Merge the update data into the existing entity
  //   const updated = this.productRepository.merge(product, updateProductDto);

  //   // Save and return the updated entity
  //   return this.productRepository.save(updated);
  // }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    await this.productRepository.remove(product);
  }
}
