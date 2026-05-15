import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from './entities/manufacturer.entity';
import manufacturersJson from '@db/manufacturers.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { SortOrder } from 'src/common/enums/enums';
import { ManufacturerOrderByColumn } from 'src/common/enums/manufacturer-order-by.enum';


const manufacturers = plainToClass(Manufacturer, manufacturersJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};

const fuse = new Fuse(manufacturers, options);

@Injectable()
export class ManufacturersService implements OnModuleInit {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.manufacturerRepository.count();

    if (count > 0) {
      return;
    }

    if (!manufacturers.length) {
      return;
    }

    await this.manufacturerRepository.save(
      manufacturers.map((manufacturer) =>
        this.manufacturerRepository.create({
          ...manufacturer,
          id: undefined,
        }),
      ),
    );
  }

  async create(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
    const existingManufacturer = await this.manufacturerRepository.findOne({
      where: { name: createManufacturerDto.name },
    });
    
    if (existingManufacturer) {
      throw new ConflictException('Manufacturer with this name already exists');
    }

    const slug = createManufacturerDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newManufacturer = this.manufacturerRepository.create({
      ...createManufacturerDto,
      slug,
      products_count: 0,
      is_approved: createManufacturerDto.is_approved ?? false,
    });

    return this.manufacturerRepository.save(newManufacturer);
  }

  async findAll({
    page = 1,
    limit = 30,
    search,
    is_approved,
    orderBy = ManufacturerOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    const query = this.manufacturerRepository.createQueryBuilder('manufacturer');

    if (is_approved !== undefined) {
      query.andWhere('manufacturer.is_approved = :is_approved', {
        is_approved,
      });
    }
    
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'name' && value) {
          query.andWhere('manufacturer.name LIKE :name', { name: `%${value}%` });
        } else if (key === 'description' && value) {
          query.andWhere('manufacturer.description LIKE :description', {
            description: `%${value}%`,
          });
        }
      }
    }

    if (orderBy === ManufacturerOrderByColumn.NAME) {
      query.orderBy('manufacturer.name', sortedBy.toUpperCase() as 'ASC' | 'DESC');
    } else if (orderBy === ManufacturerOrderByColumn.UPDATED_AT) {
      query.orderBy('manufacturer.updated_at', sortedBy.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('manufacturer.created_at', sortedBy.toUpperCase() as 'ASC' | 'DESC');
    }

    const total = await query.getCount();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = await query.skip(startIndex).take(limit).getMany();
    
    const url = `/manufacturers?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async getTopManufacturers({ limit = 10 }: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return this.manufacturerRepository.find({
      where: { is_approved: true },
      order: { products_count: 'DESC' },
      take: limit,
    });
  }

  async findOne(slug: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { slug },
    });
    
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with slug "${slug}" not found`);
    }
    
    return manufacturer;
  }

  async findById(id: number): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id },
    });
    
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    
    return manufacturer;
  }

  async update(id: number, updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer> {
    const manufacturer = await this.findById(id);
    
    Object.assign(manufacturer, updateManufacturerDto);
    
    if (updateManufacturerDto.name) {
      manufacturer.slug = updateManufacturerDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    if (updateManufacturerDto.is_approved !== undefined) {
      manufacturer.is_approved = updateManufacturerDto.is_approved;
    }
    
    manufacturer.updated_at = new Date();
    
    return this.manufacturerRepository.save(manufacturer);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    await this.findById(id);
    await this.manufacturerRepository.softDelete(id);
    
    return {
      success: true,
      message: 'Manufacturer deleted successfully',
    };
  }
}