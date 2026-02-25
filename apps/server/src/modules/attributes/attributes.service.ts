import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { generateSlug } from '../../utils/generate-slug';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributesDto, AttributePaginator } from './dto/get-attributes.dto';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { paginate } from '../common/pagination/paginate';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import { QueryAttributesOrderByColumn } from '../../common/enums/enums';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async create(createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    const slug =
      createAttributeDto.slug || generateSlug(createAttributeDto.name);

    // Check if slug already exists
    const slugExists = await this.attributeRepository.findOne({
      where: { slug },
    });
    if (slugExists) {
      throw new NotFoundException('Attribute slug already exists');
    }

    // Create attribute
    const attribute = this.attributeRepository.create({
      name: createAttributeDto.name,
      slug,
      shop_id: createAttributeDto.shop_id,
      language: createAttributeDto.language || 'en',
      translated_languages: createAttributeDto.translated_languages || [],
    });

    const savedAttribute = await this.attributeRepository.save(attribute);

    // Create attribute values
    if (createAttributeDto.values && createAttributeDto.values.length > 0) {
      const attributeValues = createAttributeDto.values.map((valueDto) =>
        this.attributeValueRepository.create({
          value: valueDto.value,
          meta: valueDto.meta,
          language: valueDto.language || 'en',
          attribute_id: savedAttribute.id,
        }),
      );
      savedAttribute.values =
        await this.attributeValueRepository.save(attributeValues);
    }

    return savedAttribute;
  }

  async findAll({
    page = 1,
    limit = 15,
    search,
    shop_id,
    language,
    orderBy = QueryAttributesOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetAttributesDto): Promise<AttributePaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<Attribute> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (shop_id) {
      where.shop_id = shop_id.toString();
    }

    if (language) {
      where.language = language;
    }

    let order: any = {};
    const orderField = this.getOrderByColumn(orderBy);
    order[orderField] = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';

    const [results, total] = await this.attributeRepository.findAndCount({
      where,
      relations: ['shop', 'values'],
      take,
      skip,
      order,
    });

    const url = `/attributes?search=${search ?? ''}&shop_id=${shop_id ?? ''}&language=${language ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(args: GetAttributeArgs): Promise<Attribute> {
    const where: FindOptionsWhere<Attribute> = {};

    if (args.id) {
      where.id = args.id;
    } else if (args.slug) {
      where.slug = args.slug;
    } else {
      throw new NotFoundException('Attribute identifier not provided');
    }

    if (args.language) {
      where.language = args.language;
    }

    const attribute = await this.attributeRepository.findOne({
      where,
      relations: ['shop', 'values'],
    });

    if (!attribute) {
      const identifier = args.id || args.slug;
      throw new NotFoundException(
        `Attribute with identifier ${identifier} not found`,
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

    // If name is being updated and no slug is provided, generate a new slug
    if (updateAttributeDto.name && !updateAttributeDto.slug) {
      updateAttributeDto.slug = generateSlug(updateAttributeDto.name);
    }

    // Check if new slug already exists (if slug is being updated)
    if (updateAttributeDto.slug && updateAttributeDto.slug !== attribute.slug) {
      const slugExists = await this.attributeRepository.findOne({
        where: { slug: updateAttributeDto.slug },
      });
      if (slugExists) {
        throw new NotFoundException('Attribute slug already exists');
      }
    }

    // Update attribute
    const updatedAttribute = this.attributeRepository.merge(
      attribute,
      updateAttributeDto,
    );
    await this.attributeRepository.save(updatedAttribute);

    // Update attribute values if provided
    if (updateAttributeDto.values) {
      // Remove existing values
      await this.attributeValueRepository.delete({ attribute_id: id });

      // Create new values
      const attributeValues = updateAttributeDto.values.map((valueDto) =>
        this.attributeValueRepository.create({
          value: valueDto.value,
          meta: valueDto.meta,
          language: valueDto.language || 'en',
          attribute_id: id,
        }),
      );
      updatedAttribute.values =
        await this.attributeValueRepository.save(attributeValues);
    }

    return updatedAttribute;
  }

  async remove(id: number): Promise<void> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    await this.attributeRepository.remove(attribute);
  }

  private getOrderByColumn(orderBy: string): string {
    switch (orderBy) {
      case 'NAME':
        return 'name';
      case 'UPDATED_AT':
        return 'updated_at';
      case 'CREATED_AT':
      default:
        return 'created_at';
    }
  }
}
