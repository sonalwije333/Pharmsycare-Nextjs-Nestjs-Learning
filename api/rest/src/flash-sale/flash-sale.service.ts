import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { FlashSale } from './entities/flash-sale.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import {
  GetFlashSaleDto,
  FlashSalePaginator,
} from './dto/get-flash-sales.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { FlashSaleOrderByColumn } from 'src/common/enums/flash-sale.enum';

@Injectable()
export class FlashSaleService {
  constructor(
    @InjectRepository(FlashSale)
    private flashSaleRepository: Repository<FlashSale>,
  ) {}

  async create(createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSale> {
    const slug = this.generateSlug(createFlashSaleDto.title);

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
      image: (createFlashSaleDto.image as unknown) as Attachment,
      cover_image: (createFlashSaleDto.cover_image as unknown) as Attachment,
      sale_builder: createFlashSaleDto.sale_builder,
      product_ids: createFlashSaleDto.product_ids,
      language: createFlashSaleDto.language || 'en',
      translated_languages: [createFlashSaleDto.language || 'en'],
      sale_status: true,
    };

    const flashSale = this.flashSaleRepository.create(flashSaleData);
    return this.flashSaleRepository.save(flashSale);
  }

  async findAll({
    page = 1,
    limit = 10,
    search,
    type,
    sale_status,
    language,
    orderBy = FlashSaleOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetFlashSaleDto): Promise<FlashSalePaginator> {
    const queryBuilder = this.flashSaleRepository.createQueryBuilder('flashSale');

    if (type) {
      queryBuilder.andWhere('flashSale.type = :type', { type });
    }

    if (sale_status !== undefined) {
      queryBuilder.andWhere('flashSale.sale_status = :sale_status', { sale_status });
    }

    if (search) {
      queryBuilder.andWhere(
        'flashSale.title LIKE :search OR flashSale.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (language) {
      queryBuilder.andWhere(
        '(flashSale.language = :language OR flashSale.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case FlashSaleOrderByColumn.TITLE:
        orderColumn = 'flashSale.title';
        break;
      case FlashSaleOrderByColumn.START_DATE:
        orderColumn = 'flashSale.start_date';
        break;
      case FlashSaleOrderByColumn.END_DATE:
        orderColumn = 'flashSale.end_date';
        break;
      case FlashSaleOrderByColumn.UPDATED_AT:
        orderColumn = 'flashSale.updated_at';
        break;
      default:
        orderColumn = 'flashSale.created_at';
    }

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

  async findOne(param: string, language?: string): Promise<FlashSale> {
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

  async update(id: number, updateFlashSaleDto: UpdateFlashSaleDto): Promise<FlashSale> {
    const flashSale = await this.flashSaleRepository.findOne({
      where: { id },
    });

    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${id} not found`);
    }

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

    if (updateFlashSaleDto.image !== undefined) {
      flashSale.image = updateFlashSaleDto.image as unknown as Attachment;
    }

    if (updateFlashSaleDto.cover_image !== undefined) {
      flashSale.cover_image = updateFlashSaleDto.cover_image as unknown as Attachment;
    }

    if (updateFlashSaleDto.sale_builder !== undefined) {
      flashSale.sale_builder = updateFlashSaleDto.sale_builder;
    }

    if (updateFlashSaleDto.product_ids !== undefined) {
      flashSale.product_ids = updateFlashSaleDto.product_ids;
    }

    if (updateFlashSaleDto.language) {
      flashSale.language = updateFlashSaleDto.language;
      if (!flashSale.translated_languages.includes(updateFlashSaleDto.language)) {
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
    return {
      data: [],
      current_page: page || 1,
      per_page: limit || 10,
      total: 0,
      last_page: 0,
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
      throw new NotFoundException(`Flash sale with ID ${flashSaleId} not found`);
    }

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