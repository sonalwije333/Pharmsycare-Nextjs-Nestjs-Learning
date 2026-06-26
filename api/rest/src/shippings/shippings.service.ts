// shipping/shippings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Shipping } from './entities/shipping.entity';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { GetShippingsDto, ShippingPaginator } from './dto/get-shippings.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import shippingsJson from '@db/shippings.json';

@Injectable()
export class ShippingsService {
  private shippings: Shipping[] = plainToClass(Shipping, shippingsJson);

  async create(createShippingDto: CreateShippingDto): Promise<Shipping> {
    const newShipping: Shipping = {
      id: this.shippings.length + 1,
      name: createShippingDto.name,
      amount: createShippingDto.amount,
      is_global: createShippingDto.is_global || false,
      type: createShippingDto.type,
      created_at: new Date(),
      updated_at: new Date(),
    } as Shipping;

    this.shippings.push(newShipping);
    return newShipping;
  }

  async findAll({
    search,
    limit = 10,
    page = 1,
    is_global,
    type,
    orderBy = 'created_at',
    sortedBy = 'desc'
  }: GetShippingsDto): Promise<ShippingPaginator> {
    let data: Shipping[] = [...this.shippings];

    // Apply filters
    if (is_global !== undefined) {
      data = data.filter(shipping => shipping.is_global === is_global);
    }

    if (type) {
      data = data.filter(shipping => shipping.type === type);
    }

    if (search) {
      const rawSearchParams = search.split(';').filter(Boolean);
      let nameSearch: string | undefined;
      let plainSearch: string | undefined;

      for (const rawParam of rawSearchParams) {
        const separatorIndex = rawParam.indexOf(':');
        if (separatorIndex === -1) {
          plainSearch = rawParam.trim();
          continue;
        }

        const key = rawParam.slice(0, separatorIndex).trim();
        const value = rawParam.slice(separatorIndex + 1).trim();

        if (!value) {
          continue;
        }

        if (key === 'name') {
          nameSearch = value;
        }
      }

      if (nameSearch) {
        const normalizedName = nameSearch.toLowerCase();
        data = data.filter((shipping) =>
          String(shipping.name ?? '').toLowerCase().includes(normalizedName),
        );
      } else {
        const fallbackSearch = (plainSearch ?? search).toLowerCase();
        const fuse = new Fuse(data, {
          keys: ['name'],
          threshold: 0.3,
        });
        data = fuse.search(fallbackSearch).map(({ item }) => item);
      }
    }

    // Apply sorting
    const sortField = (orderBy || 'created_at').toLowerCase();
    const sortDirection = (sortedBy || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'is_global':
          aValue = a.is_global;
          bValue = b.is_global;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
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
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/shippings?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<Shipping> {
    const shipping = this.shippings.find(s => s.id === id);
    
    if (!shipping) {
      throw new NotFoundException('Shipping method not found');
    }
    
    return shipping;
  }

  async update(id: number, updateShippingDto: UpdateShippingDto): Promise<Shipping> {
    const shippingIndex = this.shippings.findIndex(s => s.id === id);
    
    if (shippingIndex === -1) {
      throw new NotFoundException('Shipping method not found');
    }

    const updatedShipping = {
      ...this.shippings[shippingIndex],
      ...updateShippingDto,
      updated_at: new Date()
    };

    this.shippings[shippingIndex] = updatedShipping as Shipping;
    return updatedShipping as Shipping;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const shippingIndex = this.shippings.findIndex(s => s.id === id);
    
    if (shippingIndex === -1) {
      throw new NotFoundException('Shipping method not found');
    }

    this.shippings.splice(shippingIndex, 1);
    
    return {
      success: true,
      message: 'Shipping method deleted successfully'
    };
  }
}