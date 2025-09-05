import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';
import { GetAuthorDto, AuthorPaginator, GetTopAuthorsDto } from './dto/get-author.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateAuthorDto } from './dto/create-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { generateSlug } from 'src/utils/generate-slug';
import {QueryAuthorsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class AuthorsService {
    constructor(
        @InjectRepository(Author)
        private readonly authorRepository: Repository<Author>,
    ) {}

    async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
        const slug = createAuthorDto.slug || generateSlug(createAuthorDto.name);

        const author = this.authorRepository.create({
            ...createAuthorDto,
            slug,
            language: createAuthorDto.language || 'en',
            is_approved: createAuthorDto.is_approved || false,
            translated_languages: createAuthorDto.translated_languages || [],
        });

        return await this.authorRepository.save(author);
    }

    async getAuthors({
                         page = 1,
                         limit = 30,
                         search,
                         language,
                         is_approved,
                         shop_id,
                         orderBy,
                         // sortOrder = 'DESC'
                     }: GetAuthorDto): Promise<AuthorPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const where: any = {};

        if (search) {
            where.name = Like(`%${search}%`);
        }

        if (language) {
            where.language = language;
        }

        if (is_approved !== undefined) {
            where.is_approved = is_approved;
        }

        if (shop_id) {
            where.shop_id = shop_id;
        }

        let order = {};
        // if (orderBy) {
        //   const column = this.getOrderByColumn(orderBy);
        //   order[column] = sortOrder;
        // } else {
        //   order = { created_at: sortOrder };
        // }

        const [results, total] = await this.authorRepository.findAndCount({
            where,
            take,
            skip,
            order,
            relations: ['image', 'cover_image'],
        });

        const url = `/authors?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryAuthorsOrderByColumn): string {
        switch (orderBy) {
            case QueryAuthorsOrderByColumn.NAME:
                return 'name';
            case QueryAuthorsOrderByColumn.PRODUCTS_COUNT:
                return 'products_count';
            case QueryAuthorsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryAuthorsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getAuthorBySlug(slug: string): Promise<Author> {
        const author = await this.authorRepository.findOne({
            where: { slug },
            relations: ['image', 'cover_image'],
        });

        if (!author) {
            throw new NotFoundException(`Author with slug ${slug} not found`);
        }

        return author;
    }

    async getTopAuthors({ limit = 10 }: GetTopAuthorsDto): Promise<Author[]> {
        return this.authorRepository.find({
            order: { products_count: 'DESC' },
            take: limit,
            relations: ['image'],
        });
    }

    async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
        const author = await this.authorRepository.findOneBy({ id });

        if (!author) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }

        // If name is being updated and no slug is provided, generate a new slug
        if (updateAuthorDto.name && !updateAuthorDto.slug) {
            updateAuthorDto.slug = generateSlug(updateAuthorDto.name);
        }

        const updated = this.authorRepository.merge(author, updateAuthorDto);
        return this.authorRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const author = await this.authorRepository.findOneBy({ id });

        if (!author) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }

        await this.authorRepository.remove(author);
    }
}