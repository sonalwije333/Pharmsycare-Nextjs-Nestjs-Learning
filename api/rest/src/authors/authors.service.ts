// authors/authors.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';
import {
  GetAuthorDto,
  AuthorPaginator,
} from './dto/get-author.dto';
import { GetTopAuthorsDto } from './dto/get-top-authors.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from '../common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryAuthorsOrderByColumn } from '../common/enums/enums';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    // Generate slug from name
    const slug = this.generateSlug(createAuthorDto.name);

    // Check if author with same slug exists
    const existing = await this.authorRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Author with this name already exists');
    }

    const author = this.authorRepository.create({
      ...createAuthorDto,
      slug,
      translated_languages: [createAuthorDto.language || 'en'],
      products_count: 0,
    });

    return this.authorRepository.save(author);
  }

  async getAuthors({
    page = 1,
    limit = 30,
    search,
    orderBy = QueryAuthorsOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
    language,
  }: GetAuthorDto): Promise<AuthorPaginator> {
    const queryBuilder = this.authorRepository.createQueryBuilder('author');

    if (search) {
      const searchParams = search.split(';');
      searchParams.forEach((param) => {
        const [key, value] = param.split(':');
        if (key && value) {
          queryBuilder.andWhere(`author.${key} LIKE :${key}`, {
            [key]: `%${value}%`,
          });
        }
      });
    }

    if (language) {
      queryBuilder.andWhere(
        '(author.language = :language OR author.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    // Apply ordering
    const orderColumn =
      orderBy === QueryAuthorsOrderByColumn.NAME
        ? 'author.name'
        : orderBy === QueryAuthorsOrderByColumn.UPDATED_AT
        ? 'author.updated_at'
        : 'author.created_at';

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/authors?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async getAuthorBySlug(slug: string): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { slug },
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
    });
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    // Update fields
    if (updateAuthorDto.name) {
      author.name = updateAuthorDto.name;
      author.slug = this.generateSlug(updateAuthorDto.name);
    }

    if (updateAuthorDto.bio !== undefined) author.bio = updateAuthorDto.bio;
    if (updateAuthorDto.born !== undefined) author.born = updateAuthorDto.born;
    if (updateAuthorDto.death !== undefined)
      author.death = updateAuthorDto.death;
    if (updateAuthorDto.languages !== undefined)
      author.languages = updateAuthorDto.languages;
    if (updateAuthorDto.quote !== undefined)
      author.quote = updateAuthorDto.quote;
    if (updateAuthorDto.is_approved !== undefined)
      author.is_approved = updateAuthorDto.is_approved;
    if (updateAuthorDto.image !== undefined)
      author.image = updateAuthorDto.image;
    if (updateAuthorDto.cover_image !== undefined)
      author.cover_image = updateAuthorDto.cover_image;
    if (updateAuthorDto.socials !== undefined)
      author.socials = updateAuthorDto.socials;
    if (updateAuthorDto.language !== undefined) {
      author.language = updateAuthorDto.language;
      if (!author.translated_languages) {
        author.translated_languages = [];
      }
      if (!author.translated_languages.includes(updateAuthorDto.language)) {
        author.translated_languages.push(updateAuthorDto.language);
      }
    }

    return this.authorRepository.save(author);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const author = await this.authorRepository.findOne({
      where: { id },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    await this.authorRepository.remove(author);

    return {
      success: true,
      message: `Author with ID ${id} deleted successfully`,
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
