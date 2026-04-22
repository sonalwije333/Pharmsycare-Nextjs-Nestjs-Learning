// attributes/attributes.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAttributeDto,
  AttributeValueDto,
} from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async create(createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    // Check if attribute with same name exists in shop
    const existing = await this.attributeRepository.findOne({
      where: {
        name: createAttributeDto.name,
        shop_id: createAttributeDto.shop_id,
        language: createAttributeDto.language || 'en',
      },
    });

    if (existing) {
      throw new ConflictException(
        'Attribute with this name already exists in this shop',
      );
    }

    // Generate slug from name
    const slug = this.generateSlug(createAttributeDto.name);

    // Create new attribute
    const attribute = this.attributeRepository.create({
      name: createAttributeDto.name,
      shop_id: createAttributeDto.shop_id,
      language: createAttributeDto.language || 'en',
      slug,
      translated_languages: [createAttributeDto.language || 'en'],
    });

    const savedAttribute = await this.attributeRepository.save(attribute);

    // Create attribute values
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

    const sortColumn = (args.orderBy || 'created_at').toLowerCase();
    const sortDirection =
      String(args.sortedBy || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (['name', 'slug', 'created_at', 'updated_at'].includes(sortColumn)) {
      queryBuilder.orderBy(`attribute.${sortColumn}`, sortDirection);
    } else {
      queryBuilder.orderBy('attribute.created_at', sortDirection);
    }

    return queryBuilder.getMany();
  }

  async findOne(param: string, language?: string): Promise<Attribute> {
    const isId = !isNaN(Number(param));

    const buildQuery = (filterByLanguage: boolean) => {
      const queryBuilder = this.attributeRepository
        .createQueryBuilder('attribute')
        .leftJoinAndSelect('attribute.values', 'values');

      if (isId) {
        queryBuilder.where('attribute.id = :id', { id: Number(param) });
      } else {
        queryBuilder.where(
          '(LOWER(attribute.slug) = LOWER(:slug) OR LOWER(attribute.name) = LOWER(:name))',
          {
            slug: param,
            name: param,
          },
        );
      }

      if (language && filterByLanguage) {
        queryBuilder.andWhere(
          '(attribute.language = :language OR attribute.translated_languages LIKE :languageLike)',
          {
            language,
            languageLike: `%${language}%`,
          },
        );
      }

      return queryBuilder;
    };

    let attribute = await buildQuery(true).getOne();

    if (!attribute && language) {
      attribute = await buildQuery(false).getOne();
    }

    if (!attribute) {
      throw new NotFoundException(
        `Attribute with ${isId ? 'ID' : 'slug'} ${param} not found`,
      );
    }

    return attribute;
  }

  async update(
    id: number,
    updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    // Update fields
    if (updateAttributeDto.name) {
      attribute.name = updateAttributeDto.name;
      attribute.slug = this.generateSlug(updateAttributeDto.name);
    }

    if (updateAttributeDto.shop_id) {
      attribute.shop_id = updateAttributeDto.shop_id;
    }

    if (updateAttributeDto.language) {
      attribute.language = updateAttributeDto.language;
      if (
        !attribute.translated_languages.includes(updateAttributeDto.language)
      ) {
        attribute.translated_languages.push(updateAttributeDto.language);
      }
    }

    await this.attributeRepository.save(attribute);

    // Update values if provided
    if (updateAttributeDto.values) {
      // Delete existing values
      await this.attributeValueRepository.delete({ attribute_id: id });

      // Create new values
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

    await this.attributeRepository.remove(attribute);

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
