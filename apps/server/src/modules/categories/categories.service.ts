import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { GetCategoriesDto, CategoriesPaginator } from './dto/get-categories.dto';
import { paginate } from '../common/pagination/paginate';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategoriesPaginated({
    limit = 30,
    page = 1,
    search,
  }: GetCategoriesDto): Promise<CategoriesPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where = search
      ? [{ name: Like(`%${search}%`) }, { slug: Like(`%${search}%`) }]
      : {};

    const [results, total] = await this.categoryRepository.findAndCount({
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    const url = `/categories?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['image', 'banners', 'promotional_sliders'], // optional
    });
    if (!category) {
      throw new NotFoundException(`Type with slug ${slug} not found`);
    }
    return category;
  }

  async create(createTypeDto: CreateCategoryDto) {
    const type = this.categoryRepository.create({
      name: createTypeDto.name,
      slug: createTypeDto.slug,
      icon: createTypeDto.icon,
      language: createTypeDto.language,
      // translated_languages: createTypeDto.translated_languages,
    });

    await this.categoryRepository.save(type);
  }

  async update(id: string, updateTypeDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    // Merge the update data into the existing entity
    const updated = this.categoryRepository.merge(category, updateTypeDto);

    // Save and return the updated entity
    return this.categoryRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const type = await this.categoryRepository.findOneBy({ id });

    if (!type) {
      throw new CategoryNotFoundException(id);
    }

    await this.categoryRepository.remove(type);
  }
}
