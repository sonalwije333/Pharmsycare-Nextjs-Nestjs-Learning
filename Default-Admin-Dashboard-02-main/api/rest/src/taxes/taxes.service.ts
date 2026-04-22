// taxes/taxes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Tax } from './entities/tax.entity';
import { CreateTaxDto } from './dto/create-tax.dto';
import { GetTaxesDto, TaxPaginator } from './dto/get-taxes.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import taxesJson from '@db/taxes.json';

@Injectable()
export class TaxesService {
  private taxes: Tax[] = plainToClass(Tax, taxesJson);

  async create(createTaxDto: CreateTaxDto): Promise<Tax> {
    const newTax: Tax = {
      id: this.taxes.length + 1,
      name: createTaxDto.name,
      rate: createTaxDto.rate,
      is_global: createTaxDto.is_global ?? false,
      country: createTaxDto.country,
      state: createTaxDto.state,
      zip: createTaxDto.zip,
      city: createTaxDto.city,
      priority: createTaxDto.priority,
      on_shipping: createTaxDto.on_shipping ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    } as Tax;

    this.taxes.push(newTax);
    return newTax;
  }

  async findAll({
    search,
    limit = 10,
    page = 1,
    country,
    state,
    is_global,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetTaxesDto): Promise<TaxPaginator> {
    let data: Tax[] = [...this.taxes];

    // Apply filters
    if (country) {
      data = data.filter(tax => tax.country === country);
    }

    if (state) {
      data = data.filter(tax => tax.state === state);
    }

    if (is_global !== undefined) {
      data = data.filter(tax => tax.is_global === is_global);
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
        case 'rate':
          aValue = a.rate;
          bValue = b.rate;
          break;
        case 'country':
          aValue = a.country;
          bValue = b.country;
          break;
        case 'state':
          aValue = a.state;
          bValue = b.state;
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

    const url = `/taxes?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<Tax> {
    const tax = this.taxes.find(t => t.id === id);
    
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }
    
    return tax;
  }

  async update(id: number, updateTaxDto: UpdateTaxDto): Promise<Tax> {
    const taxIndex = this.taxes.findIndex(t => t.id === id);
    
    if (taxIndex === -1) {
      throw new NotFoundException('Tax not found');
    }

    const updatedTax = {
      ...this.taxes[taxIndex],
      ...updateTaxDto,
      updated_at: new Date()
    };

    this.taxes[taxIndex] = updatedTax as Tax;
    return updatedTax as Tax;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const taxIndex = this.taxes.findIndex(t => t.id === id);
    
    if (taxIndex === -1) {
      throw new NotFoundException('Tax not found');
    }

    this.taxes.splice(taxIndex, 1);
    
    return {
      success: true,
      message: 'Tax deleted successfully'
    };
  }
}