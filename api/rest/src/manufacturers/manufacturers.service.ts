// manufacturers/manufacturers.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

const manufacturers = plainToClass(Manufacturer, manufacturersJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};

const fuse = new Fuse(manufacturers, options);

@Injectable()
export class ManufacturersService {
  private manufacturers: Manufacturer[] = manufacturers;

  async create(createManufactureDto: CreateManufacturerDto): Promise<Manufacturer> {
    // Check if manufacturer with same name exists
    const existingManufacturer = this.manufacturers.find(
      (m) => m.name.toLowerCase() === createManufactureDto.name.toLowerCase()
    );
    
    if (existingManufacturer) {
      throw new ConflictException('Manufacturer with this name already exists');
    }

    // Commented for future use (type-related field)
    const { type_id, ...manufacturerData } = createManufactureDto;

    // Create new manufacturer with generated ID
    const newManufacturer: Manufacturer = {
      ...manufacturerData,
      id: this.manufacturers.length + 1,
      slug: createManufactureDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      products_count: 0,
      is_approved: createManufactureDto.is_approved ?? false,
      // type: null, // Commented for future use
      // type_id: createManufactureDto.type_id, // Commented for future use
    } as Manufacturer;

    this.manufacturers.push(newManufacturer);
    
    return newManufacturer;
  }

  async getManufactures({
    limit,
    page,
    search,
    is_approved,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Manufacturer[] = this.manufacturers;
    
    // Filter by approval status if provided
    if (is_approved !== undefined) {
      data = data.filter(m => m.is_approved === is_approved);
    }
    
    // Search functionality
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'name' && value) {
          data = fuse.search(value)?.map(({ item }) => item);
        } else if (key === 'type_id' && value) {
          // Commented for future use
          // data = data.filter(m => m.type_id === value);
        } else {
          data = data.filter(m => 
            m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/manufacturers?search=${search}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getTopManufactures({
    limit = 10,
  }: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return this.manufacturers
      .filter(m => m.is_approved === true)
      .sort((a, b) => (b.products_count || 0) - (a.products_count || 0))
      .slice(0, limit);
  }

  async getManufacturesBySlug(slug: string): Promise<Manufacturer> {
    const manufacturer = this.manufacturers.find(
      (singleManufacture) => singleManufacture.slug === slug
    );
    
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with slug "${slug}" not found`);
    }
    
    return manufacturer;
  }

  async getManufacturerById(id: number): Promise<Manufacturer> {
    const manufacturer = this.manufacturers.find((m) => m.id === id);
    
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
      manufacturer.slug = updateManufacturesDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    // Update approval status
    if (updateManufacturesDto.is_approved !== undefined) {
      manufacturer.is_approved = updateManufacturesDto.is_approved;
    }
    
    // Update type if provided (commented for future use)
    // if (updateManufacturesDto.type_id) {
    //   manufacturer.type_id = updateManufacturesDto.type_id;
    // }
    
    return manufacturer;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const manufacturerIndex = this.manufacturers.findIndex((m) => m.id === id);
    
    if (manufacturerIndex === -1) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    
    this.manufacturers.splice(manufacturerIndex, 1);
    
    return {
      success: true,
      message: 'Manufacturer deleted successfully',
    };
  }
}