import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateTypeDto } from './dto/create-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from './entities/type.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Like, Repository, In } from 'typeorm';
import { GetTypesDto, TypesPaginator } from './dto/get-types.dto';
import { paginate } from '../common/pagination/paginate';
import { UpdateTypeDto } from './dto/update-type.dto';
import { generateSlug } from '../../utils/generate-slug';
import { TypeNotFoundException } from './exceptions/type-not-found.exception';
import { SortOrder } from '../common/dto/generic-conditions.dto';

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createTypeDto: CreateTypeDto): Promise<Type> {
    const slug = createTypeDto.slug || generateSlug(createTypeDto.name);

    // Check if slug already exists
    const slugExists = await this.typeRepository.findOne({
      where: { slug },
    });
    if (slugExists) {
      throw new ConflictException('Type slug already exists');
    }

    const type = this.typeRepository.create({
      name: createTypeDto.name,
      slug: slug,
      icon: createTypeDto.icon,
      language: createTypeDto.language || 'en',
      banners: this.normalizeBanners(createTypeDto.banners),
      promotional_sliders: this.normalizeAttachments(
        createTypeDto.promotional_sliders,
      ),
      settings: createTypeDto.settings || {},
      translated_languages: createTypeDto.translated_languages || [],
    });

    return await this.typeRepository.save(type);
  }

  async getTypesPaginated({
    limit = 30,
    page = 1,
    search,
    text,
    language,
    orderBy,
  }: GetTypesDto): Promise<TypesPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const queryBuilder = this.typeRepository
      .createQueryBuilder('type')
      .leftJoinAndSelect('type.image', 'image')
      .leftJoinAndSelect('type.categories', 'categories')
      .leftJoinAndSelect('type.products', 'products');

    // Apply search filters
    if (search || text) {
      const searchTerm = search || text;
      queryBuilder.andWhere(
        '(LOWER(type.name) LIKE LOWER(:search) OR LOWER(type.slug) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` },
      );
    }

    if (language) {
      queryBuilder.andWhere('type.language = :language', { language });
    }

    // Apply ordering
    if (orderBy && orderBy.length > 0) {
      orderBy.forEach((orderClause) => {
        const column = this.getOrderByColumn(orderClause.column);
        const order = orderClause.order === SortOrder.ASC ? 'ASC' : 'DESC';
        queryBuilder.addOrderBy(`type.${column}`, order);
      });
    } else {
      queryBuilder.orderBy('type.created_at', 'DESC');
    }

    const [results, total] = await queryBuilder
      .take(take)
      .skip(skip)
      .getManyAndCount();

    const url = `/types?search=${search || text || ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getAllTypes(language?: string): Promise<Type[]> {
    const where = language ? { language } : {};
    return this.typeRepository.find({
      where,
      relations: ['image', 'categories'],
      order: { created_at: 'DESC' },
    });
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { slug },
      relations: ['image', 'categories', 'products'],
    });

    if (!type) {
      throw new TypeNotFoundException(slug);
    }

    return type;
  }

  async getTypeById(id: number): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { id },
      relations: ['image', 'categories', 'products'],
    });

    if (!type) {
      throw new TypeNotFoundException(id);
    }

    return type;
  }

  async update(id: string, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { id } as any,
      relations: ['image'],
    });

    if (!type) {
      throw new TypeNotFoundException(id);
    }

    const normalizedUpdateTypeDto = {
      ...updateTypeDto,
      ...(updateTypeDto.banners !== undefined
        ? { banners: this.normalizeBanners(updateTypeDto.banners) }
        : {}),
      ...(updateTypeDto.promotional_sliders !== undefined
        ? {
            promotional_sliders: this.normalizeAttachments(
              updateTypeDto.promotional_sliders,
            ),
          }
        : {}),
    };

    // If name is being updated and no slug is provided, generate a new slug
    if (normalizedUpdateTypeDto.name && !normalizedUpdateTypeDto.slug) {
      normalizedUpdateTypeDto.slug = generateSlug(normalizedUpdateTypeDto.name);
    }

    // Check if new slug already exists (if slug is being updated)
    if (
      normalizedUpdateTypeDto.slug &&
      normalizedUpdateTypeDto.slug !== type.slug
    ) {
      const slugExists = await this.typeRepository.findOne({
        where: { slug: normalizedUpdateTypeDto.slug },
      });
      if (slugExists) {
        throw new ConflictException('Type slug already exists');
      }
    }

    // Merge the update data into the existing entity
    const updated = this.typeRepository.merge(type, normalizedUpdateTypeDto);

    // Save and return the updated entity
    return this.typeRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const type = await this.typeRepository.findOne({
      where: { id } as any,
      relations: ['categories', 'products'],
    });

    if (!type) {
      throw new TypeNotFoundException(id);
    }

    // Check if type has associated categories
    if (type.categories && type.categories.length > 0) {
      throw new ConflictException(
        'Cannot delete type that has associated categories',
      );
    }

    // Check if type has associated products
    if (type.products && type.products.length > 0) {
      throw new ConflictException(
        'Cannot delete type that has associated products',
      );
    }

    await this.typeRepository.remove(type);
  }

  private getOrderByColumn(column: string): string {
    switch (column) {
      case 'NAME':
        return 'name';
      case 'UPDATED_AT':
        return 'updated_at';
      case 'CREATED_AT':
      default:
        return 'created_at';
    }
  }

  private normalizeBanners(banners?: any[]): any[] {
    if (!Array.isArray(banners)) {
      return [];
    }

    return banners
      .map((banner, index) => {
        const normalizedImage = this.normalizeAttachment(banner?.image);

        if (!normalizedImage) {
          return null;
        }

        return {
          id: banner?.id ?? index + 1,
          title: banner?.title ?? '',
          description: banner?.description ?? '',
          image: normalizedImage,
        };
      })
      .filter((banner): banner is Record<string, any> => Boolean(banner));
  }

  private normalizeAttachments(attachments?: any[]): any[] {
    if (!Array.isArray(attachments)) {
      return [];
    }

    return attachments
      .map((attachment) => this.normalizeAttachment(attachment))
      .filter(
        (attachment): attachment is Record<string, any> => Boolean(attachment),
      );
  }

  private normalizeAttachment(attachment?: any) {
    if (!attachment) {
      return null;
    }

    if (typeof attachment === 'string') {
      return {
        original: attachment,
        thumbnail: attachment,
      };
    }

    const original = attachment.original ?? attachment.thumbnail;
    const thumbnail = attachment.thumbnail ?? attachment.original;

    if (!original && !thumbnail) {
      return null;
    }

    return {
      ...(attachment.id ? { id: attachment.id } : {}),
      original,
      thumbnail,
    };
  }

  // Additional utility methods for relationships
  async getTypeCategories(typeId: number): Promise<Category[]> {
    const type = await this.getTypeById(typeId);
    return this.categoryRepository.find({
      where: { type: { id: type.id } },
      relations: ['sub_categories', 'products'],
      order: { created_at: 'DESC' },
    });
  }

  async getTypeProducts(typeId: number): Promise<Product[]> {
    const type = await this.getTypeById(typeId);
    return this.productRepository.find({
      where: { type: { id: type.id } },
      relations: ['shop', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTypesByIds(ids: number[]): Promise<Type[]> {
    return this.typeRepository.find({
      where: { id: In(ids) },
      relations: ['image'],
    });
  }
}
