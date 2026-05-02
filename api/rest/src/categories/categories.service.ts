import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  GetCategoriesDto,
  CategoryPaginator,
} from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryCategoriesOrderByColumn } from '../common/enums/enums';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Generate slug from name
    const slug = this.generateSlug(createCategoryDto.name);

    // Check if category with same slug exists
    const existing = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    // Create a new category instance
    const category = new Category();

    // Manually assign all properties
    category.name = createCategoryDto.name;
    category.slug = slug;
    category.details = createCategoryDto.details;
    category.icon = createCategoryDto.icon;
    category.image = createCategoryDto.image;
    category.type_id = createCategoryDto.type_id;
    category.language = createCategoryDto.language || 'en';
    category.translated_languages = [createCategoryDto.language || 'en'];

    // Set parent_id directly if provided
    if (createCategoryDto.parent) {
      category.parent_id = createCategoryDto.parent;
    }

    return this.categoryRepository.save(category);
  }

  async getCategories({
    page = 1,
    limit = 30,
    search,
    parent,
    language,
    type_id,
    orderBy = QueryCategoriesOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetCategoriesDto): Promise<CategoryPaginator> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('category.type', 'type');

    if (search) {
      queryBuilder.andWhere(
        '(category.name LIKE :search OR category.details LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (parent !== undefined) {
      if (parent === 'null') {
        queryBuilder.andWhere('category.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('category.parent_id = :parent', {
          parent: Number(parent),
        });
      }
    }

    if (language) {
      queryBuilder.andWhere(
        '(category.language = :language OR category.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    if (type_id) {
      queryBuilder.andWhere('category.type_id = :type_id', { type_id });
    }

    // Apply ordering
    let orderColumn = 'category.created_at';
    if (orderBy === QueryCategoriesOrderByColumn.NAME) {
      orderColumn = 'category.name';
    } else if (orderBy === QueryCategoriesOrderByColumn.UPDATED_AT) {
      orderColumn = 'category.updated_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // TODO: Uncomment this when Product module is developed
    // Calculate products count for each category
    // for (const category of data) {
    //   if (category.children && category.children.length > 0) {
    //     // For parent categories, sum products from all children
    //     let totalProducts = 0;
    //     for (const child of category.children) {
    //       const childWithProducts = await this.categoryRepository.findOne({
    //         where: { id: child.id },
    //         relations: ['products'],
    //       });
    //       totalProducts += childWithProducts?.products?.length || 0;
    //     }
    //     category.products_count = totalProducts;
    //   } else {
    //     // For leaf categories, get direct products count
    //     const categoryWithProducts = await this.categoryRepository.findOne({
    //       where: { id: category.id },
    //       relations: ['products'],
    //     });
    //     category.products_count = categoryWithProducts?.products?.length || 0;
    //   }
    // }

    const url = `/categories?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    // Calculate from and to values
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return {
      data,
      ...paginationInfo,
      from,
      to,
    };
  }

  async getCategory(param: string, language?: string): Promise<Category> {
    const isId = !isNaN(Number(param));

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('category.type', 'type');
    // TODO: Uncomment this when Product module is developed
    // .leftJoinAndSelect('category.products', 'products')

    if (isId) {
      queryBuilder.where('category.id = :id', { id: Number(param) });
    } else {
      queryBuilder.where('category.slug = :slug', { slug: param });
    }

    if (language) {
      queryBuilder.andWhere(
        '(category.language = :language OR category.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    const category = await queryBuilder.getOne();

    if (!category) {
      throw new NotFoundException(
        `Category with ${isId ? 'ID' : 'slug'} ${param} not found`,
      );
    }

    // TODO: Uncomment this when Product module is developed
    // Set products count
    // category.products_count = category.products?.length || 0;

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'type'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Update fields
    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
      category.slug = this.generateSlug(updateCategoryDto.name);
    }

    if (updateCategoryDto.details !== undefined) {
      category.details = updateCategoryDto.details;
    }

    if (updateCategoryDto.icon !== undefined) {
      category.icon = updateCategoryDto.icon;
    }

    if (updateCategoryDto.image !== undefined) {
      category.image = updateCategoryDto.image;
    }

    if (updateCategoryDto.parent !== undefined) {
      category.parent_id = updateCategoryDto.parent;
    }

    if (updateCategoryDto.type_id !== undefined) {
      category.type_id = updateCategoryDto.type_id;
    }

    if (updateCategoryDto.language) {
      category.language = updateCategoryDto.language;
      if (!category.translated_languages.includes(updateCategoryDto.language)) {
        category.translated_languages.push(updateCategoryDto.language);
      }
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'], // Removed 'products' temporarily
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    // TODO: Uncomment this when Product module is developed
    // Check if category has products
    // if (category.products && category.products.length > 0) {
    //   throw new ConflictException('Cannot delete category with products');
    // }

    await this.categoryRepository.remove(category);

    return {
      success: true,
      message: `Category with ID ${id} deleted successfully`,
    };
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 5)
    );
  }
}
