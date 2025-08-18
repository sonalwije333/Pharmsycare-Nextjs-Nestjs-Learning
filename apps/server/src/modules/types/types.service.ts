import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTypeDto } from './dto/create-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from './entities/type.entity';
import { Like, Repository } from 'typeorm';
import { GetTypesDto, TypesPaginator } from './dto/get-types.dto';
import { paginate } from '../common/pagination/paginate';
import { UpdateTypeDto } from './dto/update-type.dto';
import { generateSlug } from 'src/utils/generate-slug';

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
  ) {}

  async getTypesPaginated({
    limit = 30,
    page = 1,
    search,
  }: GetTypesDto): Promise<TypesPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where = search
      ? [{ name: Like(`%${search}%`) }, { slug: Like(`%${search}%`) }]
      : {};

    const [results, total] = await this.typeRepository.findAndCount({
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    const url = `/types?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getAllTypes(language?: string): Promise<Type[]> {
    console.log('getAllTypes');
    const where = language ? { language } : {};
    return this.typeRepository.find({
      where,
      relations: ['image'],
      order: { createdAt: 'DESC' }, // optional
    });
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { slug },
      // relations: ['image', 'banners'], // optional
    });
    if (!type) {
      throw new NotFoundException(`Type with slug ${slug} not found`);
    }
    return type;
  }

  async create(createTypeDto: CreateTypeDto) {
    const slug = createTypeDto.slug || generateSlug(createTypeDto.name);

    const type = this.typeRepository.create({
      name: createTypeDto.name,
      slug: slug,
      icon: createTypeDto.icon,
      language: createTypeDto.language,
      settings: createTypeDto.settings || {},
      // translated_languages: createTypeDto.translated_languages,
    });

    await this.typeRepository.save(type);
  }

  async update(id: string, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.typeRepository.findOneBy({ id });

    if (!type) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }

    // Merge the update data into the existing entity
    const updated = this.typeRepository.merge(type, updateTypeDto);

    // Save and return the updated entity
    return this.typeRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const type = await this.typeRepository.findOneBy({ id });

    if (!type) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }

    await this.typeRepository.remove(type);
  }
}
