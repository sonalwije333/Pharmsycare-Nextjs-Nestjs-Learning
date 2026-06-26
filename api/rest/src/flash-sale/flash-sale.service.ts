// flash-sale/flash-sale.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { FlashSale } from './entities/flash-sale.entity';
import {
  GetFlashSaleDto,
  FlashSalePaginator,
} from './dto/get-flash-sales.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryFlashSaleOrderByColumn } from '../common/enums/enums';

@Injectable()
export class FlashSaleService {
  private vendorFlashSaleRequests: any[] = [];
  private vendorFlashSaleRequestId = 1;

  constructor(
    @InjectRepository(FlashSale)
    private flashSaleRepository: Repository<FlashSale>,
  ) {}

  async create(createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSale> {
    // Generate slug from title
    const slug = this.generateSlug(createFlashSaleDto.title);

    // Check if flash sale with same slug exists
    const existing = await this.flashSaleRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Flash sale with this title already exists');
    }

    const flashSaleData: Partial<FlashSale> = {
      title: createFlashSaleDto.title,
      slug,
      description: createFlashSaleDto.description,
      start_date: createFlashSaleDto.start_date,
      end_date: createFlashSaleDto.end_date,
      type: createFlashSaleDto.type,
      rate: createFlashSaleDto.rate,
      image: createFlashSaleDto.image,
      cover_image: createFlashSaleDto.cover_image,
      sale_builder: createFlashSaleDto.sale_builder,
      product_ids: createFlashSaleDto.product_ids,
      language: createFlashSaleDto.language || 'en',
      translated_languages: [createFlashSaleDto.language || 'en'],
      sale_status: createFlashSaleDto.sale_status ?? true,
    };

    const flashSale = this.flashSaleRepository.create(flashSaleData);
    return this.flashSaleRepository.save(flashSale);
  }

  async findAllFlashSale({
    page = 1,
    limit = 10,
    search,
    type,
    sale_status,
    language,
    orderBy = QueryFlashSaleOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetFlashSaleDto): Promise<FlashSalePaginator> {
    const queryBuilder =
      this.flashSaleRepository.createQueryBuilder('flashSale');

    if (type) {
      queryBuilder.andWhere('flashSale.type = :type', { type });
    }

    if (sale_status !== undefined) {
      queryBuilder.andWhere('flashSale.sale_status = :sale_status', {
        sale_status,
      });
    }

    if (search) {
      const rawSearchParams = search.split(';').filter(Boolean);
      let searchTitle: string | undefined;
      let searchDescription: string | undefined;
      const plainSearchTerms: string[] = [];

      for (const token of rawSearchParams) {
        const separatorIndex = token.indexOf(':');
        if (separatorIndex === -1) {
          plainSearchTerms.push(token.trim());
          continue;
        }

        const key = token.slice(0, separatorIndex).trim();
        const value = token.slice(separatorIndex + 1).trim();
        if (!value) {
          continue;
        }

        if (key === 'title') {
          searchTitle = value;
        } else if (key === 'description') {
          searchDescription = value;
        } else {
          plainSearchTerms.push(value);
        }
      }

      if (searchTitle) {
        queryBuilder.andWhere('flashSale.title LIKE :searchTitle', {
          searchTitle: `%${searchTitle}%`,
        });
      }

      if (searchDescription) {
        queryBuilder.andWhere(
          'flashSale.description LIKE :searchDescription',
          {
            searchDescription: `%${searchDescription}%`,
          },
        );
      }

      if (plainSearchTerms.length) {
        const plainSearch = plainSearchTerms.join(' ');
        queryBuilder.andWhere(
          '(flashSale.title LIKE :plainSearch OR flashSale.description LIKE :plainSearch)',
          {
            plainSearch: `%${plainSearch}%`,
          },
        );
      }
    }

    if (language) {
      queryBuilder.andWhere(
        '(flashSale.language = :language OR flashSale.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    // Apply ordering
    const orderColumn =
      orderBy === QueryFlashSaleOrderByColumn.TITLE
        ? 'flashSale.title'
        : orderBy === QueryFlashSaleOrderByColumn.START_DATE
        ? 'flashSale.start_date'
        : orderBy === QueryFlashSaleOrderByColumn.END_DATE
        ? 'flashSale.end_date'
        : orderBy === QueryFlashSaleOrderByColumn.UPDATED_AT
        ? 'flashSale.updated_at'
        : 'flashSale.created_at';

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/flash-sale?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async getFlashSale(param: string, language?: string): Promise<FlashSale> {
    const isId = !isNaN(Number(param));

    const queryBuilder = this.flashSaleRepository
      .createQueryBuilder('flashSale')
      .where(isId ? 'flashSale.id = :id' : 'flashSale.slug = :slug', {
        id: isId ? Number(param) : undefined,
        slug: isId ? undefined : param,
      });

    if (language) {
      queryBuilder.andWhere(
        '(flashSale.language = :language OR flashSale.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    const flashSale = await queryBuilder.getOne();

    if (!flashSale) {
      throw new NotFoundException(
        `Flash sale with ${isId ? 'ID' : 'slug'} ${param} not found`,
      );
    }

    return flashSale;
  }

  async update(
    id: number,
    updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<FlashSale> {
    const flashSale = await this.flashSaleRepository.findOne({
      where: { id },
    });

    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${id} not found`);
    }

    // Update fields
    if (updateFlashSaleDto.title) {
      flashSale.title = updateFlashSaleDto.title;
      flashSale.slug = this.generateSlug(updateFlashSaleDto.title);
    }

    if (updateFlashSaleDto.description !== undefined) {
      flashSale.description = updateFlashSaleDto.description;
    }

    if (updateFlashSaleDto.start_date) {
      flashSale.start_date = updateFlashSaleDto.start_date;
    }

    if (updateFlashSaleDto.end_date) {
      flashSale.end_date = updateFlashSaleDto.end_date;
    }

    if (updateFlashSaleDto.type) {
      flashSale.type = updateFlashSaleDto.type;
    }

    if (updateFlashSaleDto.rate) {
      flashSale.rate = updateFlashSaleDto.rate;
    }

    if (updateFlashSaleDto.sale_status !== undefined) {
      flashSale.sale_status = updateFlashSaleDto.sale_status;
    }

    if (updateFlashSaleDto.image !== undefined) {
      flashSale.image = updateFlashSaleDto.image;
    }

    if (updateFlashSaleDto.cover_image !== undefined) {
      flashSale.cover_image = updateFlashSaleDto.cover_image;
    }

    if (updateFlashSaleDto.sale_builder !== undefined) {
      flashSale.sale_builder = updateFlashSaleDto.sale_builder;
    }

    if (updateFlashSaleDto.product_ids !== undefined) {
      flashSale.product_ids = updateFlashSaleDto.product_ids;
    }

    if (updateFlashSaleDto.language) {
      flashSale.language = updateFlashSaleDto.language;
      if (
        !flashSale.translated_languages.includes(updateFlashSaleDto.language)
      ) {
        flashSale.translated_languages = [
          ...flashSale.translated_languages,
          updateFlashSaleDto.language,
        ];
      }
    }

    return this.flashSaleRepository.save(flashSale);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const flashSale = await this.flashSaleRepository.findOne({
      where: { id },
    });

    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${id} not found`);
    }

    // Soft delete
    await this.flashSaleRepository.softDelete(id);

    return {
      success: true,
      message: `Flash sale with ID ${id} deleted successfully`,
    };
  }

  async findAllProductsByFlashSale({
    search,
    limit,
    page,
  }: GetFlashSaleDto): Promise<any> {
    // This is a placeholder until Product module is available
    // In a real implementation, you would query products that are in flash sales

    // For now, return empty paginated response
    return {
      data: [],
      current_page: page || 1,
      per_page: limit || 10,
      total: 0,
      last_page: 0,
      first_page_url: `/products-by-flash-sale?page=1&limit=${limit || 10}`,
      last_page_url: `/products-by-flash-sale?page=0&limit=${limit || 10}`,
      next_page_url: null,
      prev_page_url: null,
      from: 0,
      to: 0,
    };
  }

  async getProductsByFlashSaleId(
    flashSaleId: number,
    { limit, page }: GetFlashSaleDto,
  ): Promise<any> {
    const flashSale = await this.flashSaleRepository.findOne({
      where: { id: flashSaleId },
    });

    if (!flashSale) {
      throw new NotFoundException(
        `Flash sale with ID ${flashSaleId} not found`,
      );
    }

    // This is a placeholder until Product module is available
    // In a real implementation, you would query products by product_ids

    return {
      data: [],
      flashSale,
      current_page: page || 1,
      per_page: limit || 10,
      total: 0,
      last_page: 0,
    };
  }

  async getActiveFlashSales(): Promise<FlashSale[]> {
    const now = new Date().toISOString();

    return this.flashSaleRepository.find({
      where: {
        sale_status: true,
        start_date: LessThan(now),
        end_date: MoreThan(now),
      },
      order: { created_at: 'DESC' },
    });
  }

  async findAllVendorRequestsForFlashSale({
    page = 1,
    limit = 10,
    search,
    language,
    sortedBy = SortOrder.DESC,
  }: GetFlashSaleDto): Promise<any> {
    let data = [...this.vendorFlashSaleRequests];

    if (language) {
      data = data.filter((item) => !item.language || item.language === language);
    }

    if (search) {
      const rawSearchParams = search.split(';').filter(Boolean);
      let searchTitle: string | undefined;

      for (const token of rawSearchParams) {
        const separatorIndex = token.indexOf(':');
        if (separatorIndex === -1) {
          continue;
        }

        const key = token.slice(0, separatorIndex).trim();
        const value = token.slice(separatorIndex + 1).trim();
        if (!value) {
          continue;
        }

        if (key === 'title') {
          searchTitle = value;
        }
      }

      if (searchTitle) {
        data = data.filter((item) =>
          String(item.title || '')
            .toLowerCase()
            .includes(searchTitle!.toLowerCase()),
        );
      }
    }

    const direction = (sortedBy || SortOrder.DESC).toString().toLowerCase();
    data.sort((a, b) => {
      const aValue = new Date(a.created_at).getTime();
      const bValue = new Date(b.created_at).getTime();
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    const total = data.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = data.slice(start, end);

    return {
      data: results,
      current_page: page,
      per_page: limit,
      total,
      last_page: total ? Math.ceil(total / limit) : 0,
      first_page_url: `/vendor-requests-for-flash-sale?page=1&limit=${limit}`,
      last_page_url: `/vendor-requests-for-flash-sale?page=${
        total ? Math.ceil(total / limit) : 0
      }&limit=${limit}`,
      next_page_url:
        end < total
          ? `/vendor-requests-for-flash-sale?page=${page + 1}&limit=${limit}`
          : null,
      prev_page_url:
        page > 1
          ? `/vendor-requests-for-flash-sale?page=${page - 1}&limit=${limit}`
          : null,
      from: total ? start + 1 : 0,
      to: total ? Math.min(end, total) : 0,
    };
  }

  async getVendorRequestForFlashSale(id: number): Promise<any> {
    const request = this.vendorFlashSaleRequests.find(
      (item) => item.id === id,
    );

    if (!request) {
      throw new NotFoundException(
        `Vendor flash-sale request with ID ${id} not found`,
      );
    }

    return request;
  }

  async createVendorRequestForFlashSale(input: any): Promise<any> {
    const flashSaleId = Number(input?.flash_sale_id);
    const flashSale = Number.isNaN(flashSaleId)
      ? null
      : await this.flashSaleRepository.findOne({ where: { id: flashSaleId } });

    if (!flashSale) {
      throw new NotFoundException(
        `Flash sale with ID ${input?.flash_sale_id} not found`,
      );
    }

    const now = new Date().toISOString();
    const request = {
      id: this.vendorFlashSaleRequestId++,
      title: input?.title || flashSale.title,
      flash_sale_id: String(flashSale.id),
      requested_product_ids: Array.isArray(input?.requested_product_ids)
        ? input.requested_product_ids
        : [],
      request_status: 'pending',
      note: input?.note || '',
      language: input?.language || flashSale.language || 'en',
      flash_sale: flashSale,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    this.vendorFlashSaleRequests.push(request);
    return request;
  }

  async updateVendorRequestForFlashSale(id: number, input: any): Promise<any> {
    const request = this.vendorFlashSaleRequests.find(
      (item) => item.id === id,
    );

    if (!request) {
      throw new NotFoundException(
        `Vendor flash-sale request with ID ${id} not found`,
      );
    }

    if (input?.flash_sale_id !== undefined) {
      const flashSaleId = Number(input.flash_sale_id);
      const flashSale = Number.isNaN(flashSaleId)
        ? null
        : await this.flashSaleRepository.findOne({ where: { id: flashSaleId } });

      if (!flashSale) {
        throw new NotFoundException(
          `Flash sale with ID ${input.flash_sale_id} not found`,
        );
      }

      request.flash_sale_id = String(flashSale.id);
      request.flash_sale = flashSale;
    }

    if (input?.title !== undefined) {
      request.title = input.title;
    }

    if (input?.note !== undefined) {
      request.note = input.note;
    }

    if (input?.language !== undefined) {
      request.language = input.language;
    }

    if (Array.isArray(input?.requested_product_ids)) {
      request.requested_product_ids = input.requested_product_ids;
    }

    request.updated_at = new Date().toISOString();
    return request;
  }

  async removeVendorRequestForFlashSale(id: number): Promise<CoreMutationOutput> {
    const index = this.vendorFlashSaleRequests.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      throw new NotFoundException(
        `Vendor flash-sale request with ID ${id} not found`,
      );
    }

    this.vendorFlashSaleRequests.splice(index, 1);
    return {
      success: true,
      message: `Vendor flash-sale request with ID ${id} deleted successfully`,
    };
  }

  async approveVendorRequestForFlashSale(id: number): Promise<any> {
    const request = await this.getVendorRequestForFlashSale(id);
    request.request_status = 'approved';
    request.updated_at = new Date().toISOString();
    return request;
  }

  async disapproveVendorRequestForFlashSale(id: number): Promise<any> {
    const request = await this.getVendorRequestForFlashSale(id);
    request.request_status = 'disapproved';
    request.updated_at = new Date().toISOString();
    return request;
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 5)
    );
  }
}
