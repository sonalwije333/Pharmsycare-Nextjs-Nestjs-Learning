// manufacturers/manufacturers.service.ts
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from './entities/manufacturer.entity';
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class ManufacturersService {
  private readonly logger = new Logger(ManufacturersService.name);

  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async create(createManufactureDto: CreateManufacturerDto): Promise<Manufacturer> {
    const existingManufacturer = await this.manufacturerRepository.findOne({
      where: { name: createManufactureDto.name },
    });
    
    if (existingManufacturer) {
      throw new ConflictException('Manufacturer with this name already exists');
    }

    const manufacturer = this.manufacturerRepository.create({
      ...createManufactureDto,
      slug: this.generateSlug(createManufactureDto.name),
      products_count: 0,
      is_approved: createManufactureDto.is_approved ?? false,
      translated_languages: createManufactureDto.translated_languages ?? [createManufactureDto.language || 'en'],
      language: createManufactureDto.language || 'en',
    });

    const saved = await this.manufacturerRepository.save(manufacturer);
    this.logger.log(`Saved manufacturer id=${saved.id}, slug=${saved.slug}`);
    return saved;
  }

  async getManufactures({
    limit,
    page,
    search,
    is_approved,
    orderBy,
    sortedBy,
    language,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    const currentPage = page || 1;
    const perPage = limit || 30;
    const skip = (currentPage - 1) * perPage;
    const queryBuilder = this.manufacturerRepository.createQueryBuilder('manufacturer');

    if (is_approved !== undefined) {
      queryBuilder.andWhere('manufacturer.is_approved = :is_approved', { is_approved });
    }

    if (language) {
      queryBuilder.andWhere('manufacturer.language = :language', { language });
    }

    if (search) {
      const parsed = search.split(';').map((s) => s.trim()).filter(Boolean);
      for (const searchParam of parsed) {
        const [key, value] = searchParam.split(':');
        if (!value) continue;

        if (key === 'name') {
          queryBuilder.andWhere('LOWER(manufacturer.name) LIKE :name', {
            name: `%${value.toLowerCase()}%`,
          });
        } else if (key === 'type_id') {
          queryBuilder.andWhere('manufacturer.type_id = :type_id', {
            type_id: Number(value),
          });
        }
      }
    }

    const sortColumn = ['created_at', 'updated_at', 'name'].includes(String(orderBy).toLowerCase())
      ? String(orderBy).toLowerCase()
      : 'created_at';
    const sortDirection = String(sortedBy).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`manufacturer.${sortColumn}`, sortDirection as 'ASC' | 'DESC');

    queryBuilder.skip(skip).take(perPage);

    const [results, total] = await queryBuilder.getManyAndCount();
    const url = `/manufacturers?search=${search || ''}&limit=${perPage}`;
    
    return {
      data: results,
      ...paginate(total, currentPage, perPage, results.length, url),
    };
  }

  async getTopManufactures({
    limit = 10,
  }: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return this.manufacturerRepository.find({
      where: { is_approved: true },
      order: { products_count: 'DESC' },
      take: limit,
    });
  }

  async getManufacturesBySlug(slug: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { slug },
    });
    
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with slug "${slug}" not found`);
    }
    
    return manufacturer;
  }

  async getManufacturerById(id: number): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({ where: { id } });
    
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    
    return manufacturer;
  }

  async update(id: number, updateManufacturesDto: UpdateManufacturerDto): Promise<Manufacturer> {
    const manufacturer = await this.getManufacturerById(id);
    
    // Update manufacturer properties
    Object.assign(manufacturer, updateManufacturesDto);
    
    // Update slug if name changed
    if (updateManufacturesDto.name) {
      manufacturer.slug = this.generateSlug(updateManufacturesDto.name);
    }
    
    // Update approval status
    if (updateManufacturesDto.is_approved !== undefined) {
      manufacturer.is_approved = updateManufacturesDto.is_approved;
    }
    if (updateManufacturesDto.type_id !== undefined) {
      manufacturer.type_id = updateManufacturesDto.type_id;
    }
    
    return this.manufacturerRepository.save(manufacturer);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const manufacturer = await this.getManufacturerById(id);
    await this.manufacturerRepository.remove(manufacturer);
    
    return {
      success: true,
      message: 'Manufacturer deleted successfully',
    };
  }
}