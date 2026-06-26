// tags/tags.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Fuse from 'fuse.js';
import { Repository } from 'typeorm';
import { paginate } from 'src/common/pagination/paginate';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto, TagPaginator } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Type } from 'src/types/entities/type.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Type)
    private readonly typesRepository: Repository<Type>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let candidate = baseSlug;
    let suffix = 1;

    while (true) {
      const query = this.tagsRepository
        .createQueryBuilder('tag')
        .where('tag.slug = :slug', { slug: candidate });

      if (excludeId) {
        query.andWhere('tag.id != :excludeId', { excludeId });
      }

      const existing = await query.getOne();
      if (!existing) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const language = createTagDto.language || 'en';
    const existingTag = await this.tagsRepository.findOne({
      where: {
        name: createTagDto.name,
        language,
      },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const baseSlug = this.generateSlug(createTagDto.slug || createTagDto.name);
    const uniqueSlug = await this.generateUniqueSlug(baseSlug);

    let resolvedType: Type | null = null;
    if (createTagDto.type_id) {
      resolvedType = await this.typesRepository.findOne({ where: { id: createTagDto.type_id } });
    } else if (createTagDto.type?.id) {
      resolvedType = await this.typesRepository.findOne({ where: { id: createTagDto.type.id } });
    }

    const newTag = this.tagsRepository.create({
      name: createTagDto.name,
      slug: uniqueSlug,
      details: createTagDto.details,
      image: createTagDto.image,
      icon: createTagDto.icon,
      type: resolvedType ?? createTagDto.type,
      language,
      translated_languages: [language],
    } as Partial<Tag>);

    return this.tagsRepository.save(newTag);
  }

  async findAll({
    search,
    limit = 10,
    page = 1,
    name,
    language,
    hasType,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetTagsDto): Promise<TagPaginator> {
    let data: Tag[] = await this.tagsRepository.find();
    const direction = String(orderBy).toLowerCase();
    const sortField = String(sortedBy).toLowerCase();

    const rawSearchParams = search?.split(';').filter(Boolean) ?? [];
    let searchName: string | undefined;
    let searchType: string | undefined;
    const plainSearchTerms: string[] = [];

    for (const token of rawSearchParams) {
      const separatorIndex = token.indexOf(':');
      if (separatorIndex === -1) {
        plainSearchTerms.push(token);
        continue;
      }

      const key = token.slice(0, separatorIndex).trim();
      const value = token.slice(separatorIndex + 1).trim();
      if (!value) {
        continue;
      }

      if (key === 'name') {
        searchName = value;
      } else if (key === 'type.slug' || key === 'type' || key === 'hasType') {
        searchType = value;
      } else {
        plainSearchTerms.push(value);
      }
    }

    const effectiveName = name || searchName;
    const effectiveHasType = hasType || searchType;

    // Apply filters
    if (effectiveName) {
      data = data.filter(tag =>
        tag.name.toLowerCase().includes(effectiveName.toLowerCase()),
      );
    }

    if (language) {
      data = data.filter(tag => tag.language === language);
    }

    if (effectiveHasType) {
      data = data.filter(tag => tag.type && tag.type.slug === effectiveHasType);
    }

    if (plainSearchTerms.length) {
      const plainSearch = plainSearchTerms.join(' ');
      const fuse = new Fuse(data, {
        keys: ['name', 'details'],
        threshold: 0.3,
      });
      data = fuse.search(plainSearch)?.map(({ item }) => item);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/tags?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(param: string, language?: string): Promise<Tag> {
    const isNumeric = /^\d+$/.test(param);

    let tag: Tag | null = null;

    if (isNumeric) {
      tag = await this.tagsRepository.findOne({ where: { id: parseInt(param, 10) } });
    } else {
      tag = await this.tagsRepository.findOne({ where: { slug: param } });
    }

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (language && tag.language !== language) {
      const translated = await this.tagsRepository.findOne({
        where: { slug: tag.slug, language },
      });
      if (translated) {
        return translated;
      }
    }

    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    let slug: string | undefined;
    if (updateTagDto.name) {
      slug = await this.generateUniqueSlug(this.generateSlug(updateTagDto.name), id);
    }
    if (updateTagDto.slug) {
      slug = await this.generateUniqueSlug(this.generateSlug(updateTagDto.slug), id);
    }

    let resolvedType: Type | undefined;
    if (updateTagDto.type_id) {
      const type = await this.typesRepository.findOne({ where: { id: updateTagDto.type_id } });
      if (type) {
        resolvedType = type;
      }
    }

    const translatedLanguages = [...(tag.translated_languages || [])];
    if (updateTagDto.language && !translatedLanguages.includes(updateTagDto.language)) {
      translatedLanguages.push(updateTagDto.language);
    }

    Object.assign(tag, {
      ...updateTagDto,
      ...(slug ? { slug } : {}),
      ...(resolvedType ? { type: resolvedType } : {}),
      translated_languages: translatedLanguages,
    });

    return this.tagsRepository.save(tag);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const tag = await this.tagsRepository.findOne({ where: { id } });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.tagsRepository.remove(tag);
    
    return {
      success: true,
      message: 'Tag deleted successfully'
    };
  }
}