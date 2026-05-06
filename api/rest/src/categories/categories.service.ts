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
import { SortOrder } from 'src/common/enums/enums';
import { CategoryOrderByColumn } from 'src/common/enums/category-type.enum';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);

    const existing = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const categoryData: Partial<Category> = {
      name: createCategoryDto.name,
      slug: slug,
      details: createCategoryDto.details,
      icon: createCategoryDto.icon,
      image: createCategoryDto.image,
      type_id: createCategoryDto.type_id,
      language: createCategoryDto.language || 'en',
      translated_languages: [createCategoryDto.language || 'en'],
    };

    if (createCategoryDto.parent) {
      categoryData.parent_id = createCategoryDto.parent;
    }

    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async findAll({
    page = 1,
    limit = 30,
    search,
    parent,
    language,
    type_id,
    orderBy = CategoryOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetCategoriesDto): Promise<CategoryPaginator> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent');

    if (search) {
      queryBuilder.andWhere(
        '(category.name LIKE :search OR category.details LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (parent !== undefined && parent !== null) {
      if (parent === 0 || parent === null) {
        queryBuilder.andWhere('category.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('category.parent_id = :parent', {
          parent: parent,
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

    let orderColumn: string;
    switch (orderBy) {
      case CategoryOrderByColumn.NAME:
        orderColumn = 'category.name';
        break;
      case CategoryOrderByColumn.UPDATED_AT:
        orderColumn = 'category.updated_at';
        break;
      default:
        orderColumn = 'category.created_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/categories?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from,
      to,
    };
  }

  async findOne(param: string, language?: string): Promise<Category> {
    const isId = !isNaN(Number(param));

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent');

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

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

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
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.children && category.children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.softDelete(id);

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