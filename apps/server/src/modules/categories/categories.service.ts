// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { paginate } from '../common/pagination/paginate';
import { Category } from './entities/category.entity';
import { Type } from '../types/entities/type.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { generateSlug } from '../../utils/generate-slug';

import { SortOrder } from '../common/dto/generic-conditions.dto';
import {CategoriesPaginator, GetCategoriesDto, QueryCategoriesOrderByColumn} from './dto/get-categories.dto';

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
            const parentId = parseInt(createCategoryDto.parent_id);
            parent = await this.categoryRepository.findOne({
                where: { id: parentId } as FindOptionsWhere<Category>,
            });
            if (!parent) {
                throw new NotFoundException(`Parent category with ID ${createCategoryDto.parent_id} not found`);
            }
        }

        // Handle type if provided - check if Type uses string or numeric IDs
        let type: Type | null = null;
        if (createCategoryDto.type_id) {
            // First try to find by numeric ID
            const typeIdNum = parseInt(createCategoryDto.type_id);
            type = await this.typeRepository.findOne({
                where: { id: typeIdNum } as any, // Use any to bypass type checking
            });

            // If not found by numeric ID, try string ID
            if (!type) {
                type = await this.typeRepository.findOne({
                    where: { id: createCategoryDto.type_id } as any,
                });
            }

            if (!type) {
                throw new NotFoundException(`Type with ID ${createCategoryDto.type_id} not found`);
            }
        }


        const category = this.categoryRepository.create({
            //  name: createCategoryDto.name,
            // slug,
            // details: createCategoryDto.details,
            // icon: createCategoryDto.icon,
            // language: createCategoryDto.language || 'en',
            // translated_languages: createCategoryDto.translated_languages || [],
            // image: createCategoryDto.image,
            // banners: createCategoryDto.banners,
            // promotional_sliders: createCategoryDto.promotional_sliders,
            // parent,
            // type,
        });

        const savedCategory = await this.categoryRepository.save(category);
        // @ts-ignore
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

        const where: any = {}; // Use any to avoid complex type issues

        if (search) {
            where.name = Like(`%${search}%`);
        }

        if (language) {
            where.language = language;
        }

        if (parent) {
            const parentId = parseInt(parent);
            where.parent = { id: parentId };
        }

        if (type) {
            // Handle both string and numeric type IDs
            const typeIdNum = parseInt(type);
            if (!isNaN(typeIdNum)) {
                where.type = { id: typeIdNum };
            } else {
                where.type = { id: type };
            }
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

    private getOrderByColumn(orderBy: string | undefined): string {
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

    async getCategoryById(id: number): Promise<Category> {
        const [category] = await Promise.all([this.categoryRepository.findOne({
            where: {id},
            relations: ['image', 'banners', 'promotional_sliders', 'parent', 'children', 'type'],
        })]);

        if (!category) {
            throw new CategoryNotFoundException(id.toString());
        }

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'type'],
        });

        if (!category) {
            throw new CategoryNotFoundException(id.toString());
        }

        // Handle parent category if provided
        if (updateCategoryDto.parent_id) {
            const parentId = parseInt(updateCategoryDto.parent_id);
            const parent = await this.categoryRepository.findOne({
                where: { id: parentId } as FindOptionsWhere<Category>,
            });
            if (!parent) {
                throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parent_id} not found`);
            }
            category.parent = parent;
        }

        // Handle type if provided
        if (updateCategoryDto.type_id) {
            // Handle both string and numeric type IDs
            const typeIdNum = parseInt(updateCategoryDto.type_id);
            let type: Type | null = null;

            if (!isNaN(typeIdNum)) {
                type = await this.typeRepository.findOne({
                    where: { id: typeIdNum } as any,
                });
            }

            if (!type) {
                type = await this.typeRepository.findOne({
                    where: { id: updateCategoryDto.type_id } as any,
                });
            }

            if (!type) {
                throw new NotFoundException(`Type with ID ${updateCategoryDto.type_id} not found`);
            }
            category.type = type;
        }

        // If name is being updated and no slug is provided, generate a new slug
        if (updateCategoryDto.name && !updateCategoryDto.slug) {
            updateCategoryDto.slug = generateSlug(updateCategoryDto.name);
        }

        // Update only the provided fields
        Object.assign(category, updateCategoryDto);

        return this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children'],
        });

        if (!category) {
            throw new CategoryNotFoundException(id.toString());
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