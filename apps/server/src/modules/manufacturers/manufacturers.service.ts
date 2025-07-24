import { Injectable } from '@nestjs/common';
import { Manufacturer } from './entities/manufacturer.entity';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ManufacturerNotFoundException } from './exceptions/manufacturer-not-found.exception';

@Injectable()
export class ManufacturersService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async getManufacturersPaginated({
    limit = 30,
    page = 1,
    search,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where = search
      ? [{ name: Like(`%${search}%`) }, { slug: Like(`%${search}%`) }]
      : {};

    const [results, total] = await this.manufacturerRepository.findAndCount({
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    const url = `/manufacturers?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getBySlug(slug: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { slug },
      relations: ['image', 'banners', 'promotional_sliders'], // optional
    });
    if (!manufacturer) {
      throw new ManufacturerNotFoundException(slug);
    }
    return manufacturer;
  }

  async create(createManufacturerDto: CreateManufacturerDto) {
    const type = this.manufacturerRepository.create({
      name: createManufacturerDto.name,
      slug: createManufacturerDto.slug,
    });

    await this.manufacturerRepository.save(type);
  }

  async update(
    id: string,
    updateTypeDto: UpdateManufacturerDto,
  ): Promise<Manufacturer> {
    const type = await this.manufacturerRepository.findOneBy({ id });

    if (!type) {
      throw new ManufacturerNotFoundException(id);
    }

    // Merge the update data into the existing entity
    const updated = this.manufacturerRepository.merge(type, updateTypeDto);

    // Save and return the updated entity
    return this.manufacturerRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const manufacturer = await this.manufacturerRepository.findOneBy({ id });
    if (!manufacturer) {
      throw new ManufacturerNotFoundException(id);
    }
    await this.manufacturerRepository.softDelete(id);
  }
}
