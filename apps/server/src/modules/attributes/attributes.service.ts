import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, In } from 'typeorm';
import { generateSlug } from '../../utils/generate-slug';
import {Attribute} from "./entities/attribute.entity";
import {AttributeValue} from "./entities/attribute-value.entity";
import {CreateAttributeDto} from "./dto/create-attribute.dto";
import {AttributePaginator, GetAttributesDto} from "./dto/get-attributes.dto";
import {GetAttributeArgs} from "./dto/get-attribute.dto";
import {UpdateAttributeDto} from "./dto/update-attribute.dto";
import { paginate } from '../common/pagination/paginate';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async create(createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    const slug = generateSlug(createAttributeDto.name);

    const attribute = this.attributeRepository.create({
      ...createAttributeDto,
      slug,
      language: createAttributeDto.language || 'en',
      translated_languages: createAttributeDto.translated_languages || [],
    });

    const savedAttribute = await this.attributeRepository.save(attribute);

    // Create attribute values
    if (createAttributeDto.values && createAttributeDto.values.length > 0) {
      const attributeValues = createAttributeDto.values.map(valueDto =>
        this.attributeValueRepository.create({
          ...valueDto,
          attribute_id: savedAttribute.id,
          language: valueDto.language || 'en',
        })
      );
      savedAttribute.values = await this.attributeValueRepository.save(attributeValues);
    }

    return savedAttribute;
  }

  async findAll({
                  page = 1,
                  limit = 10,
                  search,
                  shop_id,
                  language,
                  orderBy,
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
    if (orderBy && orderBy.length > 0) {
      orderBy.forEach(orderClause => {
        const column = this.getOrderByColumn(orderClause.column);
        order[column] = orderClause.order;
      });
    } else {
      order = { created_at: 'DESC' };
    }

    const [results, total] = await this.attributeRepository.findAndCount({
      where,
      take,
      skip,
      order,
      relations: ['shop', 'values'],
    });

    const url = `/attributes?search=${search ?? ''}&shop_id=${shop_id ?? ''}&language=${language ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(param: GetAttributeArgs): Promise<Attribute> {
    const where: FindOptionsWhere<Attribute> = {};

    if (param.id) {
      where.id = param.id;
    } else if (param.slug) {
      where.slug = param.slug;
    }

    if (param.language) {
      where.language = param.language;
    }

    const attribute = await this.attributeRepository.findOne({
      where,
      relations: ['shop', 'values'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute not found`);
    }

    return attribute;
  }

  async update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({
      where: { id } as any,
      relations: ['values'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    // If name is being updated and no slug is provided, generate a new slug
    if (updateAttributeDto.name && !updateAttributeDto.slug) {
      updateAttributeDto.slug = generateSlug(updateAttributeDto.name);
    }

    // Update attribute
    const updatedAttribute = this.attributeRepository.merge(attribute, updateAttributeDto);
    await this.attributeRepository.save(updatedAttribute);

    // Update attribute values if provided
    if (updateAttributeDto.values) {
      // Remove existing values
      await this.attributeValueRepository.delete({ attribute_id: id });

      // Create new values
      const attributeValues = updateAttributeDto.values.map(valueDto =>
        this.attributeValueRepository.create({
          ...valueDto,
          attribute_id: id,
          language: valueDto.language || 'en',
        })
      );
      updatedAttribute.values = await this.attributeValueRepository.save(attributeValues);
    }

    return updatedAttribute;
  }

  async remove(id: number): Promise<void> {
    const attribute = await this.attributeRepository.findOne({
      where: { id } as any,
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    await this.attributeRepository.remove(attribute);
  }

  async getAttributesByShop(shopId: string): Promise<Attribute[]> {
    return await this.attributeRepository.find({
      where: { shop_id: shopId } as any,
      relations: ['values'],
      order: { created_at: 'DESC' },
    });
  }

  async getAttributesByLanguage(language: string): Promise<Attribute[]> {
    return await this.attributeRepository.find({
      where: { language } as any,
      relations: ['values'],
      order: { created_at: 'DESC' },
    });
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