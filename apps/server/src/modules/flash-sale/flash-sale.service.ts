import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { GetFlashSaleDto, FlashSalePaginator } from './dto/get-flash-sales.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { FlashSale } from './entities/flash-sale.entity';
import { paginate } from '../common/pagination/paginate';
import { generateSlug } from '../../utils/generate-slug';
import { QueryFlashSalesOrderByColumn } from './dto/get-flash-sales.dto';
import { Product } from '../products/entities/product.entity';
import {SortOrder} from "../common/dto/generic-conditions.dto";

@Injectable()
export class FlashSaleService {
    constructor(
        @InjectRepository(FlashSale)
        private readonly flashSaleRepository: Repository<FlashSale>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async create(createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSale> {
        const slug = createFlashSaleDto.slug || generateSlug(createFlashSaleDto.title);

        // Fetch products if they are provided as IDs
        let products: Product[] = [];
        if (createFlashSaleDto.products && createFlashSaleDto.products.length > 0) {
            const productIds = createFlashSaleDto.products.map(p =>
                typeof p === 'object' && 'id' in p ? p.id : p
            );
            products = await this.productRepository.findByIds(productIds);
        }

        const flashSale = this.flashSaleRepository.create({
            ...createFlashSaleDto,
            slug,
            products,
            language: createFlashSaleDto.language || 'en',
            sale_status: createFlashSaleDto.sale_status || false,
            translated_languages: createFlashSaleDto.translated_languages || [],
        });

        return await this.flashSaleRepository.save(flashSale);
    }

    async findAllFlashSale({
                               page = 1,
                               limit = 30,
                               search,
                               language,
                               sale_status,
                               orderBy,
                               sortOrder = SortOrder.DESC
                           }: GetFlashSaleDto): Promise<FlashSalePaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.flashSaleRepository.createQueryBuilder('flash_sale')
            .leftJoinAndSelect('flash_sale.image', 'image')
            .leftJoinAndSelect('flash_sale.cover_image', 'cover_image')
            .leftJoinAndSelect('flash_sale.products', 'products');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(flash_sale.title ILIKE :search OR flash_sale.description ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (language) {
            queryBuilder.andWhere('flash_sale.language = :language', { language });
        }

        if (sale_status !== undefined) {
            queryBuilder.andWhere('flash_sale.sale_status = :sale_status', { sale_status });
        }

        // Filter active flash sales (current date between start and end date)
        const currentDate = new Date().toISOString();
        queryBuilder.andWhere('flash_sale.start_date <= :currentDate AND flash_sale.end_date >= :currentDate', {
            currentDate,
        });

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';
        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`flash_sale.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('flash_sale.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/flash-sale?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryFlashSalesOrderByColumn): string {
        switch (orderBy) {
            case QueryFlashSalesOrderByColumn.TITLE:
                return 'title';
            case QueryFlashSalesOrderByColumn.DESCRIPTION:
                return 'description';
            case QueryFlashSalesOrderByColumn.START_DATE:
                return 'start_date';
            case QueryFlashSalesOrderByColumn.END_DATE:
                return 'end_date';
            case QueryFlashSalesOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryFlashSalesOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getFlashSale(param: string, language?: string): Promise<FlashSale> {
        const queryBuilder = this.flashSaleRepository.createQueryBuilder('flash_sale')
            .leftJoinAndSelect('flash_sale.image', 'image')
            .leftJoinAndSelect('flash_sale.cover_image', 'cover_image')
            .leftJoinAndSelect('flash_sale.products', 'products');

        if (!isNaN(Number(param))) {
            queryBuilder.where('flash_sale.id = :id', { id: Number(param) });
        } else {
            queryBuilder.where('flash_sale.slug = :slug', { slug: param });
        }

        if (language) {
            queryBuilder.andWhere('flash_sale.language = :language', { language });
        }

        const flashSale = await queryBuilder.getOne();

        if (!flashSale) {
            throw new NotFoundException(`Flash sale with identifier ${param} not found`);
        }

        return flashSale;
    }

    async update(id: number, updateFlashSaleDto: UpdateFlashSaleDto): Promise<FlashSale> {
        const flashSale = await this.flashSaleRepository.findOne({
            where: { id },
            relations: ['products'],
        });

        if (!flashSale) {
            throw new NotFoundException(`Flash sale with ID ${id} not found`);
        }

        // If title is being updated and no slug is provided, generate a new slug
        if (updateFlashSaleDto.title && !updateFlashSaleDto.slug) {
            updateFlashSaleDto.slug = generateSlug(updateFlashSaleDto.title);
        }

        // Update products if provided
        if (updateFlashSaleDto.products && updateFlashSaleDto.products.length > 0) {
            const productIds = updateFlashSaleDto.products.map(p =>
                typeof p === 'object' && 'id' in p ? p.id : p
            );
            flashSale.products = await this.productRepository.findByIds(productIds);
        }

        const updated = this.flashSaleRepository.merge(flashSale, updateFlashSaleDto);
        return this.flashSaleRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const flashSale = await this.flashSaleRepository.findOneBy({ id });

        if (!flashSale) {
            throw new NotFoundException(`Flash sale with ID ${id} not found`);
        }

        // Soft delete implementation
        flashSale.deleted_at = new Date();
        await this.flashSaleRepository.save(flashSale);
    }

    async findAllProductsByFlashSale({
                                         page = 1,
                                         limit = 30,
                                         search,
                                         language,
                                         orderBy,
                                         sortOrder = SortOrder.DESC
                                     }: GetFlashSaleDto): Promise<any> {
        // This would typically return products associated with active flash sales
        const take = limit;
        const skip = (page - 1) * take;

        const currentDate = new Date().toISOString();

        const queryBuilder = this.flashSaleRepository.createQueryBuilder('flash_sale')
            .leftJoinAndSelect('flash_sale.products', 'products')
            .where('flash_sale.start_date <= :currentDate', { currentDate })
            .andWhere('flash_sale.end_date >= :currentDate', { currentDate })
            .andWhere('flash_sale.sale_status = :saleStatus', { saleStatus: true });

        if (language) {
            queryBuilder.andWhere('flash_sale.language = :language', { language });
        }

        if (search) {
            queryBuilder.andWhere('(products.name ILIKE :search OR products.description ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        // Extract and flatten products from all flash sales
        const allProducts = results.flatMap(flashSale => flashSale.products);
        const uniqueProducts = this.removeDuplicateProducts(allProducts);

        const url = `/products-by-flash-sale?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(uniqueProducts.length, page, limit, uniqueProducts.length, url);

        return {
            data: uniqueProducts,
            ...paginationInfo,
        };
    }

    private removeDuplicateProducts(products: Product[]): Product[] {
        const seen = new Set();
        return products.filter(product => {
            const duplicate = seen.has(product.id);
            seen.add(product.id);
            return !duplicate;
        });
    }
}