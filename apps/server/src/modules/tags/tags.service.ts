import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto, TagPaginator } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not } from 'typeorm';
import { generateSlug } from 'src/utils/generate-slug';
import {paginate} from "../common/pagination/paginate";
import {QueryTagsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {}

    async create(createTagDto: CreateTagDto): Promise<Tag> {
        const slug = createTagDto.slug || generateSlug(createTagDto.name);

        const tag = this.tagRepository.create({
            ...createTagDto,
            slug,
            language: createTagDto.language || 'en',
            translated_languages: createTagDto.translated_languages || [],
            details: createTagDto.details || '',
            icon: createTagDto.icon || '',
        });

        return await this.tagRepository.save(tag);
    }

    async findAll(getTagsDto: GetTagsDto): Promise<TagPaginator> {
        const { page = 1, limit = 30, search, text, name, hasType, language, orderBy, sortOrder = 'DESC' } = getTagsDto;

        const take = limit;
        const skip = (page - 1) * take;

        const where: any = {};

        if (search || text) {
            const searchText = search || text;
            where.name = Like(`%${searchText}%`);
        }

        if (name) {
            where.name = Like(`%${name}%`);
        }

        if (language) {
            where.language = language;
        }

        if (hasType === 'true') {
            where.type = Not(IsNull());
        } else if (hasType === 'false') {
            where.type = IsNull();
        }

        let order = {};
        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            order[column] = sortOrder;
        } else {
            order = { created_at: sortOrder };
        }

        const [results, total] = await this.tagRepository.findAndCount({
            where,
            take,
            skip,
            order,
            relations: ['image', 'type'],
        });

        const url = `/tags?limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryTagsOrderByColumn): string {
        switch (orderBy) {
            case QueryTagsOrderByColumn.NAME:
                return 'name';
            case QueryTagsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryTagsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findOne(param: string, language?: string): Promise<Tag> {
        const where: any = {};

        // Check if param is numeric (ID) or string (slug)
        if (!isNaN(Number(param))) {
            where.id = Number(param);
        } else {
            where.slug = param;
        }

        if (language) {
            where.language = language;
        }

        const tag = await this.tagRepository.findOne({
            where,
            relations: ['image', 'type'],
        });

        if (!tag) {
            throw new NotFoundException(`Tag with ID or slug ${param} not found`);
        }

        return tag;
    }

    async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
        const tag = await this.tagRepository.findOneBy({ id });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        // If name is being updated and no slug is provided, generate a new slug
        if (updateTagDto.name && !updateTagDto.slug) {
            updateTagDto.slug = generateSlug(updateTagDto.name);
        }

        const updated = this.tagRepository.merge(tag, updateTagDto);
        return this.tagRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const tag = await this.tagRepository.findOneBy({ id });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        await this.tagRepository.remove(tag);
    }
}