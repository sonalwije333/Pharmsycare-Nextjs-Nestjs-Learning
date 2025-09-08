import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { Manufacturer } from './entities/manufacturer.entity';
import { paginate } from '../common/pagination/paginate';
import { QueryManufacturersOrderByColumn } from "../../common/enums/enums";
import { SortOrder } from "../common/dto/generic-conditions.dto";
import { generateSlug } from "../../utils/generate-slug";
import {GetManufacturersDto, GetTopManufacturersDto, ManufacturerPaginator} from "./dto/get-manufactures.dto";

@Injectable()
export class ManufacturersService {
    constructor(
        @InjectRepository(Manufacturer)
        private readonly manufacturerRepository: Repository<Manufacturer>,
    ) {}

    async create(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
        const slug = createManufacturerDto.slug || generateSlug(createManufacturerDto.name);

        const manufacturer = this.manufacturerRepository.create({
            ...createManufacturerDto,
            slug,
            language: createManufacturerDto.language || 'en',
            translated_languages: createManufacturerDto.translated_languages || [],
        });

        return await this.manufacturerRepository.save(manufacturer);
    }

    async findAllManufacturers({
                                   page = 1,
                                   limit = 30,
                                   search,
                                   language,
                                   orderBy,
                                   sortOrder = SortOrder.DESC
                               }: GetManufacturersDto): Promise<ManufacturerPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.manufacturerRepository.createQueryBuilder('manufacturer');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(manufacturer.name ILIKE :search OR manufacturer.slug ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (language) {
            queryBuilder.andWhere('manufacturer.language = :language', { language });
        }

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`manufacturer.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('manufacturer.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/manufacturers?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    async getTopManufacturers({ limit = 10 }: GetTopManufacturersDto): Promise<Manufacturer[]> {
        return this.manufacturerRepository.find({
            take: limit,
            order: { created_at: 'DESC' },
        });
    }

    private getOrderByColumn(orderBy: QueryManufacturersOrderByColumn): string {
        switch (orderBy) {
            case QueryManufacturersOrderByColumn.NAME:
                return 'name';
            case QueryManufacturersOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryManufacturersOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getManufacturer(param: string, language?: string): Promise<Manufacturer> {
        const queryBuilder = this.manufacturerRepository.createQueryBuilder('manufacturer');

        if (!isNaN(Number(param))) {
            queryBuilder.where('manufacturer.id = :id', { id: Number(param) });
        } else {
            queryBuilder.where('manufacturer.slug = :slug', { slug: param });
        }

        if (language) {
            queryBuilder.andWhere('manufacturer.language = :language', { language });
        }

        const manufacturer = await queryBuilder.getOne();

        if (!manufacturer) {
            throw new NotFoundException(`Manufacturer with identifier ${param} not found`);
        }

        return manufacturer;
    }

    async update(id: number, updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer> {
        const manufacturer = await this.manufacturerRepository.findOneBy({ id });

        if (!manufacturer) {
            throw new NotFoundException(`Manufacturer with ID ${id} not found`);
        }

        // If name is being updated and no slug is provided, generate a new slug
        if (updateManufacturerDto.name && !updateManufacturerDto.slug) {
            updateManufacturerDto.slug = generateSlug(updateManufacturerDto.name);
        }

        const updated = this.manufacturerRepository.merge(manufacturer, updateManufacturerDto);
        return this.manufacturerRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const manufacturer = await this.manufacturerRepository.findOneBy({ id });

        if (!manufacturer) {
            throw new NotFoundException(`Manufacturer with ID ${id} not found`);
        }

        // Soft delete implementation
        manufacturer.deleted_at = new Date();
        await this.manufacturerRepository.save(manufacturer);
    }
}