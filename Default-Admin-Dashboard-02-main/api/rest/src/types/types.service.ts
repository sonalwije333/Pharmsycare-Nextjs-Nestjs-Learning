// types/types.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Type } from './entities/type.entity';
import { CreateTypeDto } from './dto/create-type.dto';
import { GetTypesDto, TypePaginator } from './dto/get-types.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import typesJson from '@db/types.json';

@Injectable()
export class TypesService {
  private types: Type[] = plainToClass(Type, typesJson);

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createTypeDto: CreateTypeDto): Promise<Type> {
    const existingType = this.types.find(t => t.name === createTypeDto.name);
    if (existingType) {
      throw new NotFoundException('Type with this name already exists');
    }

    const newType: Type = {
      id: this.types.length + 1,
      name: createTypeDto.name,
      slug: this.generateSlug(createTypeDto.name),
      image: createTypeDto.image,
      icon: createTypeDto.icon,
      banners: createTypeDto.banners,
      promotional_sliders: createTypeDto.promotional_sliders,
      settings: createTypeDto.settings,
      language: createTypeDto.language || 'en',
      translated_languages: [createTypeDto.language || 'en'],
      created_at: new Date(),
      updated_at: new Date(),
    } as Type;

    this.types.push(newType);
    return newType;
  }

  async findAll({
    search,
    limit = 10,
    page = 1,
    language,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetTypesDto): Promise<TypePaginator> {
    let data: Type[] = [...this.types];

    // Apply filters
    if (language) {
      data = data.filter(type => type.language === language);
    }

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['name'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (orderBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/types?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const type = this.types.find(t => t.slug === slug);
    
    if (!type) {
      throw new NotFoundException('Type not found');
    }
    
    return type;
  }

  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const typeIndex = this.types.findIndex(t => t.id === id);
    
    if (typeIndex === -1) {
      throw new NotFoundException('Type not found');
    }

    const updatedType = {
      ...this.types[typeIndex],
      ...updateTypeDto,
      updated_at: new Date()
    };

    if (updateTypeDto.name) {
      updatedType.slug = this.generateSlug(updateTypeDto.name);
    }

    this.types[typeIndex] = updatedType as Type;
    return updatedType as Type;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const typeIndex = this.types.findIndex(t => t.id === id);
    
    if (typeIndex === -1) {
      throw new NotFoundException('Type not found');
    }

    this.types.splice(typeIndex, 1);
    
    return {
      success: true,
      message: 'Type deleted successfully'
    };
  }
}