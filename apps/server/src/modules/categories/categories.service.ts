import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, DeepPartial, In } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { paginate } from '../common/pagination/paginate';
import { Category } from './entities/category.entity';
import { Type } from '../types/entities/type.entity';
import { Product } from '../products/entities/product.entity';
import {
  CategoryNotFoundException,
  CategoryHasChildrenException,
  CategoryTypeNotFoundException,
  CategoryParentNotFoundException,
} from './exceptions/category-not-found.exception';
import { generateSlug } from '../../utils/generate-slug';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import {
  CategoriesPaginator,
  GetCategoriesDto,
  QueryCategoriesOrderByColumn,
} from './dto/get-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = createCategoryDto.slug || generateSlug(createCategoryDto.name);

    // Check if slug already exists
    const existingSlug = await this.categoryRepository.findOne({
      where: { slug },
    });
    if (existingSlug) {
      throw new NotFoundException(
        `Category with slug "${slug}" already exists`,
      );
    }

    // Handle parent category if provided
    let parent: Category | undefined;
    if (createCategoryDto.parent_id) {
      parent =
        (await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parent_id as any },
        })) ?? undefined;
      if (!parent) {
        throw new CategoryParentNotFoundException(createCategoryDto.parent_id);
      }
    }

    // Handle type if provided
    let type: Type | undefined;
    if (createCategoryDto.type_id) {
      type =
        (await this.typeRepository.findOne({
        where: { id: createCategoryDto.type_id as any },
        })) ?? undefined;
      if (!type) {
        throw new CategoryTypeNotFoundException(createCategoryDto.type_id);
      }
    }

    const categoryData: DeepPartial<Category> = {
      name: createCategoryDto.name,
      slug,
      details: createCategoryDto.details,
      icon: createCategoryDto.icon,
      language: createCategoryDto.language || 'en',
      translated_languages: createCategoryDto.translated_languages || [],
      image: createCategoryDto.image as any,
      banners: createCategoryDto.banners as any,
      promotional_sliders: createCategoryDto.promotional_sliders as any,
      parent,
      type,
      is_approved: false,
      products_count: 0,
    };

    const category = this.categoryRepository.create(categoryData);

    const savedCategory = await this.categoryRepository.save(category);
    return savedCategory;
  }

  async getCategories({
    page = 1,
    limit = 30,
    search,
    language,
    parent,
    type,
    is_approved,
    orderBy = QueryCategoriesOrderByColumn.CREATED_AT,
    sortOrder = SortOrder.DESC,
  }: GetCategoriesDto): Promise<CategoriesPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.image', 'image')
      .leftJoinAndSelect('category.banners', 'banners')
      .leftJoinAndSelect('category.promotional_sliders', 'sliders')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.type', 'type')
      .leftJoinAndSelect('category.children', 'children');

    if (search) {
      queryBuilder.andWhere('LOWER(category.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (language) {
      queryBuilder.andWhere('category.language = :language', { language });
    }

    if (parent) {
      queryBuilder.andWhere('parent.id = :parent', { parent });
    }

    if (type) {
      queryBuilder.andWhere('type.id = :type', { type });
    }

    if (is_approved !== undefined) {
      queryBuilder.andWhere('category.is_approved = :is_approved', {
        is_approved,
      });
    }

    // Apply ordering
    const orderColumn = this.getOrderByColumn(orderBy);
    const orderDirection = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`category.${orderColumn}`, orderDirection);

    const [results, total] = await queryBuilder
      .take(take)
      .skip(skip)
      .getManyAndCount();

    const url = `/categories?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getTopCategories(limit = 10): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { is_approved: true },
      order: { products_count: 'DESC' },
      take: limit,
      relations: ['image', 'type'],
    });
  }

  async getCategoryTree(language?: string): Promise<Category[]> {
    const where: any = { parent: null };
    if (language) {
      where.language = language;
    }

    return this.categoryRepository.find({
      where,
      relations: ['image', 'type', 'children', 'children.image'],
      order: { name: 'ASC' },
    });
  }

  async getCategoriesByType(
    typeId: string,
    language?: string,
  ): Promise<Category[]> {
    const where: any = { type: { id: typeId } };
    if (language) {
      where.language = language;
    }

    return this.categoryRepository.find({
      where,
      relations: ['image', 'parent'],
      order: { name: 'ASC' },
    });
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: [
        'image',
        'banners',
        'promotional_sliders',
        'parent',
        'children',
        'type',
        'children.image',
      ],
    });

    if (!category) {
      throw new CategoryNotFoundException(slug);
    }

    // Update products count
    const productsCount = await this.productRepository.count({
      where: { category: { id: category.id } },
    });
    category.products_count = productsCount;

    return category;
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: [
        'image',
        'banners',
        'promotional_sliders',
        'parent',
        'children',
        'type',
        'children.image',
      ],
    });

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    // Update products count
    const productsCount = await this.productRepository.count({
      where: { category: { id } },
    });
    category.products_count = productsCount;

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.getCategoryById(id);

    // Handle slug generation if name is updated
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateCategoryDto.slug = generateSlug(updateCategoryDto.name);
    }

    // Check slug uniqueness if slug is being updated
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });
      if (existingSlug) {
        throw new NotFoundException(
          `Category with slug "${updateCategoryDto.slug}" already exists`,
        );
      }
    }

    // Handle parent category update
    if (updateCategoryDto.parent_id) {
      if (updateCategoryDto.parent_id === id.toString()) {
        throw new NotFoundException('Category cannot be its own parent');
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parent_id as any },
      });
      if (!parent) {
        throw new CategoryParentNotFoundException(updateCategoryDto.parent_id);
      }
      category.parent = parent;
    }

    // Handle type update
    if (updateCategoryDto.type_id) {
      const type = await this.typeRepository.findOne({
        where: { id: updateCategoryDto.type_id as any },
      });
      if (!type) {
        throw new CategoryTypeNotFoundException(updateCategoryDto.type_id);
      }
      category.type = type;
    }

    // Update other fields
    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.getCategoryById(id);

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new CategoryHasChildrenException(id);
    }

    // Check if category has products
    const productsCount = await this.productRepository.count({
      where: { category: { id } },
    });
    if (productsCount > 0) {
      throw new NotFoundException(
        `Cannot delete category with ${productsCount} associated products`,
      );
    }

    await this.categoryRepository.remove(category);
  }

  async approveCategory(id: number): Promise<Category> {
    const category = await this.getCategoryById(id);
    category.is_approved = true;
    return this.categoryRepository.save(category);
  }

  async disapproveCategory(id: number): Promise<Category> {
    const category = await this.getCategoryById(id);
    category.is_approved = false;
    return this.categoryRepository.save(category);
  }

  private getOrderByColumn(orderBy: QueryCategoriesOrderByColumn): string {
    switch (orderBy) {
      case QueryCategoriesOrderByColumn.NAME:
        return 'name';
      case QueryCategoriesOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryCategoriesOrderByColumn.PRODUCTS_COUNT:
        return 'products_count';
      case QueryCategoriesOrderByColumn.CREATED_AT:
      default:
        return 'created_at';
    }
  }
}
