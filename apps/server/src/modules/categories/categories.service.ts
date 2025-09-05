// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { paginate } from '../common/pagination/paginate';
import { Category } from './entities/category.entity';
import { Type } from '../types/entities/type.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { generateSlug } from '../../utils/generate-slug';
import {CategoriesPaginator, GetCategoriesDto, QueryCategoriesOrderByColumn} from "./dto/get-categories.dto";


@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Type)
        private readonly typeRepository: Repository<Type>,
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const slug = createCategoryDto.slug || generateSlug(createCategoryDto.name);

        // Handle parent category if provided
        let parent: Category | null = null;
        if (createCategoryDto.parent_id) {
            parent = await this.categoryRepository.findOne({
                where: { id: createCategoryDto.parent_id },
            });
            if (!parent) {
                throw new NotFoundException(`Parent category with ID ${createCategoryDto.parent_id} not found`);
            }
        }

        // Handle type if provided
        let type: Type | null = null;
        if (createCategoryDto.type_id) {
            type = await this.typeRepository.findOne({
                where: { id: createCategoryDto.type_id },
            });
            if (!type) {
                throw new NotFoundException(`Type with ID ${createCategoryDto.type_id} not found`);
            }
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
            parent,
            type,
            language: createCategoryDto.language || 'en',
            translated_languages: createCategoryDto.translated_languages || [],
        });

        return await this.categoryRepository.save(category);
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
                            sortOrder = 'DESC',
                        }: GetCategoriesDto): Promise<CategoriesPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const where: FindOptionsWhere<Category> = {};

        if (search) {
            where.name = Like(`%${search}%`);
        }

        if (language) {
            where.language = language;
        }

        if (parent) {
            where.parent = { id: parent };
        }

        if (type) {
            where.type = { id: type };
        }

        if (is_approved !== undefined) {
            where.is_approved = is_approved;
        }

        const order = {};
        const column = this.getOrderByColumn(orderBy);
        order[column] = sortOrder;

        const [results, total] = await this.categoryRepository.findAndCount({
            where,
            take,
            skip,
            order,
            relations: ['image', 'banners', 'promotional_sliders', 'parent', 'type'],
        });

        const url = `/categories?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryCategoriesOrderByColumn): string {
        switch (orderBy) {
            case QueryCategoriesOrderByColumn.NAME:
                return 'name';
            case QueryCategoriesOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryCategoriesOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getCategoryBySlug(slug: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { slug },
            relations: ['image', 'banners', 'promotional_sliders', 'parent', 'children', 'type'],
        });

        if (!category) {
            throw new CategoryNotFoundException(slug);
        }

        return category;
    }

    async getCategoryById(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['image', 'banners', 'promotional_sliders', 'parent', 'children', 'type'],
        });

        if (!category) {
            throw new CategoryNotFoundException(id);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'type'],
        });

        if (!category) {
            throw new CategoryNotFoundException(id);
        }

        // Handle parent category if provided
        if (updateCategoryDto.parent_id) {
            const parent = await this.categoryRepository.findOne({
                where: { id: updateCategoryDto.parent_id },
            });
            if (!parent) {
                throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parent_id} not found`);
            }
            category.parent = parent;
        }

        // Handle type if provided
        if (updateCategoryDto.type_id) {
            const type = await this.typeRepository.findOne({
                where: { id: updateCategoryDto.type_id },
            });
            if (!type) {
                throw new NotFoundException(`Type with ID ${updateCategoryDto.type_id} not found`);
            }
            category.type = type;
        }

        // If name is being updated and no slug is provided, generate a new slug
        if (updateCategoryDto.name && !updateCategoryDto.slug) {
            updateCategoryDto.slug = generateSlug(updateCategoryDto.name);
        }

        const updated = this.categoryRepository.merge(category, updateCategoryDto);
        return this.categoryRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children'],
        });

        if (!category) {
            throw new CategoryNotFoundException(id);
        }

        // Check if category has children
        if (category.children && category.children.length > 0) {
            throw new NotFoundException('Cannot delete category with child categories');
        }

        await this.categoryRepository.remove(category);
    }

    async getTopCategories(limit = 10): Promise<Category[]> {
        return this.categoryRepository.find({
            order: { products_count: 'DESC' },
            take: limit,
            relations: ['image'],
        });
    }
}