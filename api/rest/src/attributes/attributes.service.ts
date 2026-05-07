import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttributeDto, AttributeValueDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { SortOrder } from 'src/common/enums/enums';
import { AttributeOrderByColumn } from 'src/common/enums/attribute-order-by.enum';


@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async create(createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    const language = createAttributeDto.language || 'en';
    
    // Check if attribute exists
    const existing = await this.attributeRepository.findOne({
      where: {
        name: createAttributeDto.name,
        shop_id: createAttributeDto.shop_id,
        language: language,
      },
      relations: ['values'],
    });

    // If exists, update values and return
    if (existing) {
      if (createAttributeDto.values && createAttributeDto.values.length > 0) {
        // Delete old values
        await this.attributeValueRepository.delete({ attribute_id: existing.id });
        
        // Create new values
        const values = createAttributeDto.values.map((val) =>
          this.attributeValueRepository.create({
            value: val.value,
            meta: val.meta,
            language: val.language || 'en',
            shop_id: parseInt(existing.shop_id),
            attribute_id: existing.id,
            translated_languages: [val.language || 'en'],
          }),
        );
        
        await this.attributeValueRepository.save(values);
      }
      return this.findOne(existing.id.toString());
    }

    // Create new attribute
    const slug = this.generateSlug(createAttributeDto.name);

    const attribute = this.attributeRepository.create({
      name: createAttributeDto.name,
      shop_id: createAttributeDto.shop_id,
      language: createAttributeDto.language || 'en',
      slug,
      translated_languages: [createAttributeDto.language || 'en'],
    });

    const savedAttribute = await this.attributeRepository.save(attribute);

    if (createAttributeDto.values && createAttributeDto.values.length > 0) {
      const values = createAttributeDto.values.map((val) =>
        this.attributeValueRepository.create({
          value: val.value,
          meta: val.meta,
          language: val.language || 'en',
          shop_id: parseInt(savedAttribute.shop_id),
          attribute_id: savedAttribute.id,
          translated_languages: [val.language || 'en'],
        }),
      );

      await this.attributeValueRepository.save(values);
    }

    return this.findOne(savedAttribute.id.toString());
  }

  async findAll(args: GetAttributesArgs): Promise<Attribute[]> {
    const queryBuilder = this.attributeRepository
      .createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'values');

    if (args.shop_id) {
      queryBuilder.andWhere('attribute.shop_id = :shop_id', {
        shop_id: args.shop_id.toString(),
      });
    }

    if (args.language) {
      queryBuilder.andWhere(
        '(attribute.language = :language OR attribute.translated_languages LIKE :languageLike)',
        {
          language: args.language,
          languageLike: `%${args.language}%`,
        },
      );
    }

    const orderByClause =
      args.orderBy && args.orderBy.length > 0
        ? args.orderBy[0]
        : args.column
          ? {
              column: args.column,
              order: args.order || SortOrder.DESC,
            }
          : null;

    if (orderByClause) {
      let column: string;
      switch (orderByClause.column) {
        case AttributeOrderByColumn.NAME:
          column = 'attribute.name';
          break;
        case AttributeOrderByColumn.UPDATED_AT:
          column = 'attribute.updated_at';
          break;
        default:
          column = 'attribute.created_at';
      }
      const orderDirection = orderByClause.order === SortOrder.ASC ? 'ASC' : 'DESC';
      queryBuilder.orderBy(column, orderDirection);
    } else {
      queryBuilder.orderBy('attribute.created_at', 'DESC');
    }

    return queryBuilder.getMany();
  }

  async findOne(param: string, language?: string): Promise<Attribute> {
    const normalizedParam = this.normalizeIdOrSlugParam(param);
    const isId = !isNaN(Number(normalizedParam));

    const queryBuilder = this.attributeRepository
      .createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'values')
      .where(isId ? 'attribute.id = :id' : 'attribute.slug = :slug', {
        id: isId ? Number(normalizedParam) : undefined,
        slug: isId ? undefined : normalizedParam,
      });

    if (language) {
      queryBuilder.andWhere(
        '(attribute.language = :language OR attribute.translated_languages LIKE :languageLike)',
        {
          language,
          languageLike: `%${language}%`,
        },
      );
    }

    let attribute = await queryBuilder.getOne();

    // If the incoming value is not numeric but starts with a number
    // (e.g. "1 or color" from Swagger placeholder-style input),
    // try resolving by the leading id as a fallback.
    if (!attribute && !isId) {
      const leadingId = normalizedParam.match(/^\d+/)?.[0];
      if (leadingId) {
        const fallbackQuery = this.attributeRepository
          .createQueryBuilder('attribute')
          .leftJoinAndSelect('attribute.values', 'values')
          .where('attribute.id = :id', { id: Number(leadingId) });

        if (language) {
          fallbackQuery.andWhere(
            '(attribute.language = :language OR attribute.translated_languages LIKE :languageLike)',
            {
              language,
              languageLike: `%${language}%`,
            },
          );
        }

        attribute = await fallbackQuery.getOne();
      }
    }

    if (!attribute) {
      throw new NotFoundException(
        `Attribute with ${isId ? 'ID' : 'slug'} ${normalizedParam} not found`,
      );
    }

    return attribute;
  }

  private normalizeIdOrSlugParam(param: string): string {
    if (!param) return param;

    const trimmed = param.trim();

    // Swagger examples sometimes get pasted literally as "1 or color".
    const placeholderLike = /^\d+\s+or\s+/i;
    if (placeholderLike.test(trimmed)) {
      return trimmed.split(/\s+or\s+/i)[0].trim();
    }

    return trimmed;
  }

  async update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    if (updateAttributeDto.name) {
      attribute.name = updateAttributeDto.name;
      attribute.slug = this.generateSlug(updateAttributeDto.name);
    }

    if (updateAttributeDto.shop_id) {
      attribute.shop_id = updateAttributeDto.shop_id;
    }

    if (updateAttributeDto.language) {
      attribute.language = updateAttributeDto.language;
      if (!attribute.translated_languages.includes(updateAttributeDto.language)) {
        attribute.translated_languages.push(updateAttributeDto.language);
      }
    }

    await this.attributeRepository.save(attribute);

    if (updateAttributeDto.values) {
      await this.attributeValueRepository.softDelete({ attribute_id: id });

      const newValues = updateAttributeDto.values.map((val) =>
        this.attributeValueRepository.create({
          value: val.value,
          meta: val.meta,
          language: val.language || 'en',
          shop_id: parseInt(attribute.shop_id),
          attribute_id: id,
          translated_languages: [val.language || 'en'],
        }),
      );

      await this.attributeValueRepository.save(newValues);
    }

    return this.findOne(id.toString());
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    await this.attributeRepository.softDelete(id);

    return {
      success: true,
      message: `Attribute with ID ${id} deleted successfully`,
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