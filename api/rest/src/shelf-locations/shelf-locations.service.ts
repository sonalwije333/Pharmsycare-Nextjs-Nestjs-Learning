import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShelfLocation } from './entities/shelf-location.entity';
import { ProductShelfLocation } from './entities/product-shelf-location.entity';
import { CreateShelfLocationDto } from './dto/create-shelf-location.dto';
import { UpdateShelfLocationDto } from './dto/update-shelf-location.dto';
import { AssignProductDto } from './dto/assign-product.dto';
import { GetShelfLocationsDto } from './dto/get-shelf-locations.dto';
import { ProductsService } from '../products/products.service';

export interface ProductLocationResult {
  product_id: number;
  name: string;
  sku: string | null;
  slug: string | null;
  image: any;
  quantity: number;
  in_stock: boolean;
  location: {
    shelf_location_id: number;
    code: string;
    name: string;
    zone: string;
    aisle: string | null;
    bin: string | null;
    color: string | null;
  } | null;
}

export type ShelfWithCount = Omit<ShelfLocation, 'product_mappings'> & {
  product_count: number;
};

export interface ShelfLayoutZone {
  zone: string;
  shelves: ShelfWithCount[];
}

@Injectable()
export class ShelfLocationsService implements OnModuleInit {
  constructor(
    @InjectRepository(ShelfLocation)
    private readonly shelfRepository: Repository<ShelfLocation>,
    @InjectRepository(ProductShelfLocation)
    private readonly mappingRepository: Repository<ProductShelfLocation>,
    private readonly productsService: ProductsService,
  ) {}

  // Seed a small starter pharmacy layout the first time the module boots so the
  // visual map and locator have data to work with out of the box.
  async onModuleInit(): Promise<void> {
    const count = await this.shelfRepository.count();
    if (count > 0) {
      return;
    }

    const seedShelves: CreateShelfLocationDto[] = [
      { code: 'A1', name: 'Analgesics & Painkillers', zone: 'Zone A', aisle: 'Aisle 1', row_index: 0, column_index: 0, color: '#6366f1' },
      { code: 'A2', name: 'Antibiotics', zone: 'Zone A', aisle: 'Aisle 1', row_index: 0, column_index: 1, color: '#8b5cf6' },
      { code: 'A3', name: 'Antihistamines', zone: 'Zone A', aisle: 'Aisle 1', row_index: 1, column_index: 0, color: '#ec4899' },
      { code: 'B1', name: 'Cardiovascular', zone: 'Zone B', aisle: 'Aisle 2', row_index: 0, column_index: 0, color: '#ef4444' },
      { code: 'B2', name: 'Diabetes Care', zone: 'Zone B', aisle: 'Aisle 2', row_index: 0, column_index: 1, color: '#f97316' },
      { code: 'B3', name: 'Vitamins & Supplements', zone: 'Zone B', aisle: 'Aisle 2', row_index: 1, column_index: 0, color: '#f59e0b' },
      { code: 'C1', name: 'Cold Storage (Refrigerated)', zone: 'Zone C', aisle: 'Aisle 3', row_index: 0, column_index: 0, color: '#06b6d4' },
      { code: 'C2', name: 'Topical & Dermatology', zone: 'Zone C', aisle: 'Aisle 3', row_index: 0, column_index: 1, color: '#10b981' },
    ];

    const createdShelves: ShelfLocation[] = [];
    for (const dto of seedShelves) {
      createdShelves.push(
        await this.shelfRepository.save(
          this.shelfRepository.create({ ...dto, is_active: true }),
        ),
      );
    }

    // Spread the first batch of catalogue medicines across the new shelves.
    const { data: products } = this.productsService.getProducts({
      page: 1,
      limit: 40,
    });

    let shelfIndex = 0;
    let assigned = 0;
    for (const product of products) {
      const shelf = createdShelves[shelfIndex % createdShelves.length];
      await this.assignProduct(shelf.id, {
        product_id: Number(product.id),
        bin: `Bin ${(assigned % 6) + 1}`,
      });
      shelfIndex += 1;
      assigned += 1;
      if (assigned >= 24) {
        break;
      }
    }
  }

  async create(dto: CreateShelfLocationDto): Promise<ShelfLocation> {
    const existing = await this.shelfRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Shelf with code "${dto.code}" already exists`,
      );
    }

    const shelf = this.shelfRepository.create({
      code: dto.code,
      name: dto.name,
      zone: dto.zone || 'General',
      aisle: dto.aisle ?? null,
      row_index: dto.row_index ?? 0,
      column_index: dto.column_index ?? 0,
      color: dto.color ?? null,
      description: dto.description ?? null,
      capacity: dto.capacity ?? null,
      is_active: dto.is_active ?? true,
    });

    return this.shelfRepository.save(shelf);
  }

  async findAll(
    query: GetShelfLocationsDto,
  ): Promise<{ data: ShelfLocation[]; total: number; page: number; limit: number }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;

    const builder = this.shelfRepository
      .createQueryBuilder('shelf')
      .loadRelationCountAndMap('shelf.product_count', 'shelf.product_mappings')
      .orderBy('shelf.zone', 'ASC')
      .addOrderBy('shelf.row_index', 'ASC')
      .addOrderBy('shelf.column_index', 'ASC');

    if (query.search) {
      builder.andWhere(
        '(shelf.code LIKE :search OR shelf.name LIKE :search OR shelf.zone LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.zone) {
      builder.andWhere('shelf.zone = :zone', { zone: query.zone });
    }

    if (query.is_active !== undefined) {
      builder.andWhere('shelf.is_active = :is_active', {
        is_active: query.is_active === 'true',
      });
    }

    const [data, total] = await builder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  // Grouped, ordered structure consumed by the visual floor-map renderer.
  async getLayout(): Promise<{
    zones: ShelfLayoutZone[];
    total_shelves: number;
    total_assigned_products: number;
  }> {
    const shelves = await this.shelfRepository.find({
      relations: ['product_mappings'],
      order: { zone: 'ASC', row_index: 'ASC', column_index: 'ASC' },
    });

    const zoneMap = new Map<string, ShelfLayoutZone>();
    let totalAssigned = 0;

    for (const shelf of shelves) {
      const productCount = shelf.product_mappings?.length ?? 0;
      totalAssigned += productCount;

      const enriched: ShelfWithCount = { ...shelf, product_count: productCount };

      if (!zoneMap.has(shelf.zone)) {
        zoneMap.set(shelf.zone, { zone: shelf.zone, shelves: [] });
      }
      zoneMap.get(shelf.zone)!.shelves.push(enriched);
    }

    return {
      zones: Array.from(zoneMap.values()),
      total_shelves: shelves.length,
      total_assigned_products: totalAssigned,
    };
  }

  async findOne(id: number): Promise<ShelfLocation> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: ['product_mappings'],
    });
    if (!shelf) {
      throw new NotFoundException(`Shelf location with ID ${id} not found`);
    }
    return shelf;
  }

  // Shelf plus the live catalogue details of every product placed on it.
  async getShelfProducts(id: number): Promise<{
    shelf: ShelfLocation;
    products: ProductLocationResult[];
  }> {
    const shelf = await this.findOne(id);
    const products = (shelf.product_mappings ?? []).map((mapping) =>
      this.buildLocationResult(mapping.product_id, mapping, shelf),
    );
    return { shelf, products };
  }

  async update(
    id: number,
    dto: UpdateShelfLocationDto,
  ): Promise<ShelfLocation> {
    const shelf = await this.findOne(id);

    if (dto.code && dto.code !== shelf.code) {
      const clash = await this.shelfRepository.findOne({
        where: { code: dto.code },
      });
      if (clash) {
        throw new ConflictException(
          `Shelf with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(shelf, {
      code: dto.code ?? shelf.code,
      name: dto.name ?? shelf.name,
      zone: dto.zone ?? shelf.zone,
      aisle: dto.aisle ?? shelf.aisle,
      row_index: dto.row_index ?? shelf.row_index,
      column_index: dto.column_index ?? shelf.column_index,
      color: dto.color ?? shelf.color,
      description: dto.description ?? shelf.description,
      capacity: dto.capacity ?? shelf.capacity,
      is_active: dto.is_active ?? shelf.is_active,
    });

    return this.shelfRepository.save(shelf);
  }

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const shelf = await this.findOne(id);
    await this.mappingRepository.delete({ shelf_location_id: shelf.id });
    await this.shelfRepository.remove(shelf);
    return { id, deleted: true };
  }

  async assignProduct(
    shelfId: number,
    dto: AssignProductDto,
  ): Promise<ProductShelfLocation> {
    await this.findOne(shelfId);

    const product = this.productsService.getProductById(dto.product_id);
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${dto.product_id} not found`,
      );
    }

    let mapping = await this.mappingRepository.findOne({
      where: { product_id: dto.product_id },
    });

    if (mapping) {
      mapping.shelf_location_id = shelfId;
      mapping.bin = dto.bin ?? mapping.bin;
      mapping.note = dto.note ?? mapping.note;
    } else {
      mapping = this.mappingRepository.create({
        product_id: dto.product_id,
        shelf_location_id: shelfId,
        bin: dto.bin ?? null,
        note: dto.note ?? null,
      });
    }

    mapping.product_name = product.name ?? null;
    mapping.product_sku = product.sku ?? null;
    mapping.product_slug = product.slug ?? null;
    mapping.product_image = product.image ?? null;

    return this.mappingRepository.save(mapping);
  }

  async unassignProduct(
    productId: number,
  ): Promise<{ product_id: number; removed: boolean }> {
    const mapping = await this.mappingRepository.findOne({
      where: { product_id: productId },
    });
    if (!mapping) {
      throw new NotFoundException(
        `Product ${productId} is not assigned to any shelf`,
      );
    }
    await this.mappingRepository.remove(mapping);
    return { product_id: productId, removed: true };
  }

  // Locate a single product (e.g. when a prescription line is scanned/selected).
  async locateProduct(productId: number): Promise<ProductLocationResult> {
    const product = this.productsService.getProductById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const mapping = await this.mappingRepository.findOne({
      where: { product_id: productId },
      relations: ['shelf_location'],
    });

    return this.buildLocationResult(productId, mapping, mapping?.shelf_location);
  }

  // Free-text medicine search returning each match together with its shelf.
  // This powers the "where is it?" lookup for prescriptions (online or onsite).
  async searchProductLocations(
    text?: string,
  ): Promise<ProductLocationResult[]> {
    if (!text || !text.trim()) {
      return [];
    }

    const { data: products } = this.productsService.getProducts({
      search: text.trim(),
      page: 1,
      limit: 20,
    });

    if (products.length === 0) {
      return [];
    }

    const productIds = products.map((product) => Number(product.id));
    const mappings = await this.mappingRepository.find({
      where: productIds.map((product_id) => ({ product_id })),
      relations: ['shelf_location'],
    });
    const mappingByProduct = new Map<number, ProductShelfLocation>();
    for (const mapping of mappings) {
      mappingByProduct.set(mapping.product_id, mapping);
    }

    return products.map((product) => {
      const id = Number(product.id);
      const mapping = mappingByProduct.get(id);
      return this.buildLocationResult(id, mapping, mapping?.shelf_location, product);
    });
  }

  private buildLocationResult(
    productId: number,
    mapping?: ProductShelfLocation | null,
    shelf?: ShelfLocation | null,
    productOverride?: any,
  ): ProductLocationResult {
    const product = productOverride ?? this.productsService.getProductById(productId);

    return {
      product_id: productId,
      name: product?.name ?? mapping?.product_name ?? `Product #${productId}`,
      sku: product?.sku ?? mapping?.product_sku ?? null,
      slug: product?.slug ?? mapping?.product_slug ?? null,
      image: product?.image ?? mapping?.product_image ?? null,
      quantity: Number(product?.quantity ?? 0),
      in_stock: product ? Number(product.in_stock) !== 0 : false,
      location:
        mapping && shelf
          ? {
              shelf_location_id: shelf.id,
              code: shelf.code,
              name: shelf.name,
              zone: shelf.zone,
              aisle: shelf.aisle ?? null,
              bin: mapping.bin ?? null,
              color: shelf.color ?? null,
            }
          : null,
    };
  }
}
