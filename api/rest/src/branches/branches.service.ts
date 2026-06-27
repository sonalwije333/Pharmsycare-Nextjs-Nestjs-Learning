import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { BranchInventory } from './entities/branch-inventory.entity';
import { BranchTransfer } from './entities/branch-transfer.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { ProductsService } from '../products/products.service';
import { User } from '../users/entities/user.entity';

export interface VendorSummary {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export interface BranchOverview {
  total_branches: number;
  active_branches: number;
  total_skus: number;
  total_stock_units: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export interface BranchStock {
  branch_id: number;
  code: string;
  name: string;
  city: string;
  quantity: number;
  reorder_level: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_stocked';
}

export interface AvailabilityResult {
  product_id: number;
  name: string;
  sku: string | null;
  image: any;
  total_quantity: number;
  available_branch_count: number;
  branches: BranchStock[];
}

@Injectable()
export class BranchesService implements OnModuleInit {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchInventory)
    private readonly inventoryRepository: Repository<BranchInventory>,
    @InjectRepository(BranchTransfer)
    private readonly transferRepository: Repository<BranchTransfer>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly productsService: ProductsService,
  ) {}

  private trimVendor(user?: User | null): VendorSummary | null {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      is_active: user.is_active,
    };
  }

  // Vendors are store-owner users that can be assigned to operate a branch.
  async getVendors(search?: string): Promise<VendorSummary[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where("user.permissions LIKE '%store_owner%'")
      .orderBy('user.name', 'ASC')
      .take(50);

    if (search && search.trim()) {
      query.andWhere('(user.name LIKE :s OR user.email LIKE :s)', {
        s: `%${search.trim()}%`,
      });
    }

    const users = await query.getMany();
    return users.map((user) => this.trimVendor(user)!);
  }

  // Seed a starter branch network with distributed stock so all multi-branch
  // views (availability, centralized inventory, coordination) have data.
  async onModuleInit(): Promise<void> {
    const count = await this.branchRepository.count();
    if (count > 0) {
      return;
    }

    const seedBranches: Array<CreateBranchDto> = [
      { code: 'BR-COL', name: 'Colombo Main Branch', city: 'Colombo', address: '45 Galle Road, Colombo 03', phone: '+94112345678', manager_name: 'Nimal Perera', is_main: true },
      { code: 'BR-KAN', name: 'Kandy Branch', city: 'Kandy', address: '12 Peradeniya Road, Kandy', phone: '+94812233445', manager_name: 'Sunil Bandara' },
      { code: 'BR-GAL', name: 'Galle Branch', city: 'Galle', address: '8 Main Street, Galle Fort', phone: '+94912244556', manager_name: 'Kamala Silva' },
      { code: 'BR-JAF', name: 'Jaffna Branch', city: 'Jaffna', address: '23 Hospital Road, Jaffna', phone: '+94212255667', manager_name: 'Arun Rajan' },
    ];

    const branches: Branch[] = [];
    for (const dto of seedBranches) {
      branches.push(
        await this.branchRepository.save(
          this.branchRepository.create({
            ...dto,
            is_active: true,
          }),
        ),
      );
    }

    const { data: products } = this.productsService.getProducts({
      page: 1,
      limit: 50,
    });

    const rows: BranchInventory[] = [];
    products.forEach((product, pi) => {
      branches.forEach((branch, bi) => {
        // Leave a deterministic gap so some branches do not stock some drugs.
        if ((pi + bi) % 4 === 0) {
          return;
        }
        const quantity = ((pi + 1) * (bi + 3) * 7) % 75;
        rows.push(
          this.inventoryRepository.create({
            branch_id: branch.id,
            product_id: Number(product.id),
            quantity,
            reorder_level: 15,
            price: product.sale_price ?? product.price ?? null,
            product_name: product.name ?? null,
            product_sku: product.sku ?? null,
            product_slug: product.slug ?? null,
            product_image: product.image ?? null,
          }),
        );
      });
    });

    if (rows.length > 0) {
      await this.inventoryRepository.save(rows);
    }
  }

  async create(dto: CreateBranchDto): Promise<Branch> {
    const existing = await this.branchRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Branch code "${dto.code}" already exists`);
    }

    if (dto.vendor_id != null) {
      await this.assertVendorExists(dto.vendor_id);
    }

    const saved = await this.branchRepository.save(
      this.branchRepository.create({
        code: dto.code,
        name: dto.name,
        city: dto.city || 'General',
        address: dto.address ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        manager_name: dto.manager_name ?? null,
        vendor_id: dto.vendor_id ?? null,
        is_main: dto.is_main ?? false,
        is_active: dto.is_active ?? true,
      }),
    );

    return this.findOne(saved.id);
  }

  private async assertVendorExists(vendorId: number): Promise<void> {
    const vendor = await this.usersRepository.findOne({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }
  }

  async findAll(): Promise<
    Array<
      Omit<Branch, 'inventory' | 'vendor'> & {
        vendor: VendorSummary | null;
        sku_count: number;
        total_units: number;
        low_stock_count: number;
      }
    >
  > {
    const branches = await this.branchRepository.find({
      relations: ['inventory', 'vendor'],
      order: { is_main: 'DESC', created_at: 'ASC' },
    });

    return branches.map((branch) => {
      const inventory = branch.inventory ?? [];
      const totalUnits = inventory.reduce((sum, row) => sum + row.quantity, 0);
      const lowStock = inventory.filter(
        (row) => row.quantity <= row.reorder_level,
      ).length;
      const { inventory: _omit, vendor, ...rest } = branch;
      return {
        ...rest,
        vendor: this.trimVendor(vendor),
        sku_count: inventory.length,
        total_units: totalUnits,
        low_stock_count: lowStock,
      };
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['inventory', 'vendor'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // Enrich inventory rows with the live catalogue quantity status.
    branch.inventory = (branch.inventory ?? []).sort((a, b) =>
      (a.product_name ?? '').localeCompare(b.product_name ?? ''),
    );
    // Return only a safe summary of the vendor user.
    branch.vendor = this.trimVendor(branch.vendor) as unknown as User;
    return branch;
  }

  async update(id: number, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    if (dto.code && dto.code !== branch.code) {
      const clash = await this.branchRepository.findOne({
        where: { code: dto.code },
      });
      if (clash) {
        throw new ConflictException(`Branch code "${dto.code}" already exists`);
      }
    }

    if (dto.vendor_id != null) {
      await this.assertVendorExists(dto.vendor_id);
    }

    Object.assign(branch, {
      code: dto.code ?? branch.code,
      name: dto.name ?? branch.name,
      city: dto.city ?? branch.city,
      address: dto.address ?? branch.address,
      phone: dto.phone ?? branch.phone,
      email: dto.email ?? branch.email,
      manager_name: dto.manager_name ?? branch.manager_name,
      vendor_id: dto.vendor_id ?? branch.vendor_id,
      is_main: dto.is_main ?? branch.is_main,
      is_active: dto.is_active ?? branch.is_active,
    });

    // Persist by FK column only; drop the (trimmed) relation object so TypeORM
    // does not override vendor_id from a stale vendor instance.
    branch.vendor = undefined;

    await this.branchRepository.save(branch);
    return this.findOne(branch.id);
  }

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const branch = await this.findOne(id);
    await this.inventoryRepository.delete({ branch_id: branch.id });
    await this.branchRepository.remove(branch);
    return { id, deleted: true };
  }

  async getOverview(): Promise<BranchOverview> {
    const [branches, inventory] = await Promise.all([
      this.branchRepository.find(),
      this.inventoryRepository.find(),
    ]);

    const distinctSkus = new Set(inventory.map((row) => row.product_id));
    const totalUnits = inventory.reduce((sum, row) => sum + row.quantity, 0);
    const lowStock = inventory.filter(
      (row) => row.quantity > 0 && row.quantity <= row.reorder_level,
    ).length;
    const outOfStock = inventory.filter((row) => row.quantity === 0).length;

    return {
      total_branches: branches.length,
      active_branches: branches.filter((b) => b.is_active).length,
      total_skus: distinctSkus.size,
      total_stock_units: totalUnits,
      low_stock_items: lowStock,
      out_of_stock_items: outOfStock,
    };
  }

  async upsertInventory(
    branchId: number,
    dto: UpsertInventoryDto,
  ): Promise<BranchInventory> {
    await this.findOne(branchId);
    const product = this.productsService.getProductById(dto.product_id);
    if (!product) {
      throw new NotFoundException(`Product ${dto.product_id} not found`);
    }

    let row = await this.inventoryRepository.findOne({
      where: { branch_id: branchId, product_id: dto.product_id },
    });

    if (!row) {
      row = this.inventoryRepository.create({
        branch_id: branchId,
        product_id: dto.product_id,
        reorder_level: 15,
      });
    }

    row.quantity = dto.quantity;
    row.reorder_level = dto.reorder_level ?? row.reorder_level;
    row.price = dto.price ?? row.price ?? product.price ?? null;
    row.product_name = product.name ?? null;
    row.product_sku = product.sku ?? null;
    row.product_slug = product.slug ?? null;
    row.product_image = product.image ?? null;

    return this.inventoryRepository.save(row);
  }

  async removeInventory(
    branchId: number,
    productId: number,
  ): Promise<{ removed: boolean }> {
    const row = await this.inventoryRepository.findOne({
      where: { branch_id: branchId, product_id: productId },
    });
    if (!row) {
      throw new NotFoundException('Inventory record not found');
    }
    await this.inventoryRepository.remove(row);
    return { removed: true };
  }

  // Cross-branch drug availability: which branches stock a searched medicine.
  async searchAvailability(text?: string): Promise<AvailabilityResult[]> {
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

    const branches = await this.branchRepository.find({
      where: { is_active: true },
      order: { is_main: 'DESC', name: 'ASC' },
    });
    const productIds = products.map((p) => Number(p.id));
    const inventory = await this.inventoryRepository.find({
      where: { product_id: In(productIds) },
    });

    const invByProduct = new Map<number, Map<number, BranchInventory>>();
    for (const row of inventory) {
      if (!invByProduct.has(row.product_id)) {
        invByProduct.set(row.product_id, new Map());
      }
      invByProduct.get(row.product_id)!.set(row.branch_id, row);
    }

    return products.map((product) => {
      const id = Number(product.id);
      const branchMap = invByProduct.get(id) ?? new Map();
      let total = 0;
      let availableCount = 0;

      const branchStocks: BranchStock[] = branches.map((branch) => {
        const row = branchMap.get(branch.id);
        const quantity = row?.quantity ?? 0;
        const reorder = row?.reorder_level ?? 0;
        total += quantity;
        if (row && quantity > 0) {
          availableCount += 1;
        }
        return {
          branch_id: branch.id,
          code: branch.code,
          name: branch.name,
          city: branch.city,
          quantity,
          reorder_level: reorder,
          status: this.stockStatus(row, quantity),
        };
      });

      return {
        product_id: id,
        name: product.name,
        sku: product.sku ?? null,
        image: product.image ?? null,
        total_quantity: total,
        available_branch_count: availableCount,
        branches: branchStocks,
      };
    });
  }

  // Centralized inventory: a product x branch matrix with totals.
  async getCentralizedInventory(query: GetInventoryDto): Promise<{
    branches: Array<Pick<Branch, 'id' | 'code' | 'name' | 'city'>>;
    data: Array<{
      product_id: number;
      name: string;
      sku: string | null;
      image: any;
      total_quantity: number;
      quantities: Record<number, number>;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const branches = await this.branchRepository.find({
      order: { is_main: 'DESC', name: 'ASC' },
    });

    const inventory = await this.inventoryRepository.find();

    // Group inventory by product.
    const productMap = new Map<
      number,
      {
        product_id: number;
        name: string;
        sku: string | null;
        image: any;
        total_quantity: number;
        quantities: Record<number, number>;
      }
    >();

    for (const row of inventory) {
      if (!productMap.has(row.product_id)) {
        productMap.set(row.product_id, {
          product_id: row.product_id,
          name: row.product_name ?? `Product #${row.product_id}`,
          sku: row.product_sku ?? null,
          image: row.product_image ?? null,
          total_quantity: 0,
          quantities: {},
        });
      }
      const entry = productMap.get(row.product_id)!;
      entry.quantities[row.branch_id] = row.quantity;
      entry.total_quantity += row.quantity;
    }

    let data = Array.from(productMap.values());

    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          (item.sku ?? '').toLowerCase().includes(needle),
      );
    }

    data.sort((a, b) => a.name.localeCompare(b.name));

    const total = data.length;
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + limit);

    return {
      branches: branches.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        city: b.city,
      })),
      data: paged,
      total,
      page,
      limit,
    };
  }

  // Branch coordination: low-stock rows plus suggested inter-branch transfers.
  async getCoordination(): Promise<{
    low_stock: Array<{
      branch_id: number;
      branch_name: string;
      product_id: number;
      product_name: string | null;
      quantity: number;
      reorder_level: number;
    }>;
    suggestions: Array<{
      product_id: number;
      product_name: string | null;
      from_branch_id: number;
      from_branch_name: string;
      to_branch_id: number;
      to_branch_name: string;
      suggested_quantity: number;
    }>;
  }> {
    const [branches, inventory] = await Promise.all([
      this.branchRepository.find({ where: { is_active: true } }),
      this.inventoryRepository.find(),
    ]);
    const branchById = new Map(branches.map((b) => [b.id, b]));

    const lowStock = inventory
      .filter(
        (row) =>
          branchById.has(row.branch_id) &&
          row.quantity <= row.reorder_level,
      )
      .map((row) => ({
        branch_id: row.branch_id,
        branch_name: branchById.get(row.branch_id)!.name,
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        reorder_level: row.reorder_level,
      }))
      .sort((a, b) => a.quantity - b.quantity);

    // Build per-product stock map to find a surplus donor branch.
    const byProduct = new Map<number, BranchInventory[]>();
    for (const row of inventory) {
      if (!branchById.has(row.branch_id)) continue;
      if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, []);
      byProduct.get(row.product_id)!.push(row);
    }

    const suggestions: Array<{
      product_id: number;
      product_name: string | null;
      from_branch_id: number;
      from_branch_name: string;
      to_branch_id: number;
      to_branch_name: string;
      suggested_quantity: number;
    }> = [];

    for (const low of lowStock) {
      const rows = byProduct.get(low.product_id) ?? [];
      const target = low.reorder_level * 2;
      const needed = Math.max(target - low.quantity, 1);

      // Donor: branch with the highest surplus above its own reorder level.
      let donor: BranchInventory | null = null;
      let donorSurplus = 0;
      for (const row of rows) {
        if (row.branch_id === low.branch_id) continue;
        const surplus = row.quantity - row.reorder_level * 2;
        if (surplus > donorSurplus) {
          donorSurplus = surplus;
          donor = row;
        }
      }

      if (donor && donorSurplus > 0) {
        suggestions.push({
          product_id: low.product_id,
          product_name: low.product_name,
          from_branch_id: donor.branch_id,
          from_branch_name: branchById.get(donor.branch_id)!.name,
          to_branch_id: low.branch_id,
          to_branch_name: low.branch_name,
          suggested_quantity: Math.min(needed, donorSurplus),
        });
      }
    }

    return { low_stock: lowStock, suggestions };
  }

  async getTransfers(): Promise<BranchTransfer[]> {
    return this.transferRepository.find({
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async createTransfer(dto: CreateTransferDto): Promise<BranchTransfer> {
    if (dto.from_branch_id === dto.to_branch_id) {
      throw new BadRequestException(
        'Source and destination branches must differ',
      );
    }

    const [fromBranch, toBranch] = await Promise.all([
      this.findOne(dto.from_branch_id),
      this.findOne(dto.to_branch_id),
    ]);

    const fromRow = await this.inventoryRepository.findOne({
      where: { branch_id: dto.from_branch_id, product_id: dto.product_id },
    });
    if (!fromRow || fromRow.quantity < dto.quantity) {
      throw new BadRequestException(
        'Source branch does not have enough stock for this transfer',
      );
    }

    const product = this.productsService.getProductById(dto.product_id);

    fromRow.quantity -= dto.quantity;
    await this.inventoryRepository.save(fromRow);

    let toRow = await this.inventoryRepository.findOne({
      where: { branch_id: dto.to_branch_id, product_id: dto.product_id },
    });
    if (!toRow) {
      toRow = this.inventoryRepository.create({
        branch_id: dto.to_branch_id,
        product_id: dto.product_id,
        quantity: 0,
        reorder_level: fromRow.reorder_level,
        price: fromRow.price,
        product_name: fromRow.product_name ?? product?.name ?? null,
        product_sku: fromRow.product_sku ?? product?.sku ?? null,
        product_slug: fromRow.product_slug ?? product?.slug ?? null,
        product_image: fromRow.product_image ?? product?.image ?? null,
      });
    }
    toRow.quantity += dto.quantity;
    await this.inventoryRepository.save(toRow);

    return this.transferRepository.save(
      this.transferRepository.create({
        product_id: dto.product_id,
        product_name: fromRow.product_name ?? product?.name ?? null,
        from_branch_id: fromBranch.id,
        from_branch_name: fromBranch.name,
        to_branch_id: toBranch.id,
        to_branch_name: toBranch.name,
        quantity: dto.quantity,
        note: dto.note ?? null,
      }),
    );
  }

  private stockStatus(
    row: BranchInventory | undefined,
    quantity: number,
  ): BranchStock['status'] {
    if (!row) return 'not_stocked';
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= row.reorder_level) return 'low_stock';
    return 'in_stock';
  }
}
