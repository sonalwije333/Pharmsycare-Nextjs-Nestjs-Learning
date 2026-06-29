// src/config/database/seeders/pharmacy-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../../../products/entities/product.entity';
import { Shop } from '../../../shops/entities/shop.entity';
import { User } from '../../../users/entities/user.entity';
import { Permission } from '../../../common/enums/enums';

import { Supplier } from '../../../suppliers/entities/supplier.entity';
import { ProductSupplier } from '../../../suppliers/entities/product-supplier.entity';
import { Branch } from '../../../branches/entities/branch.entity';
import { BranchInventory } from '../../../branches/entities/branch-inventory.entity';
import { ShelfLocation } from '../../../shelf-locations/entities/shelf-location.entity';
import { ProductShelfLocation } from '../../../shelf-locations/entities/product-shelf-location.entity';
import {
  ReorderRequest,
  ReorderRequestStatus,
  ReorderNotificationChannel,
} from '../../../reorder-requests/entities/reorder-request.entity';
import {
  GoodsReceivedNote,
  GrnStatus,
} from '../../../goods-received-notes/entities/goods-received-note.entity';
import { GrnItem } from '../../../goods-received-notes/entities/goods-received-note-item.entity';
import {
  ProcurementRecord,
  ProcurementStatus,
} from '../../../procurement-history/entities/procurement-record.entity';
import {
  Prescription,
  PrescriptionStatus,
} from '../../../prescriptions/prescription.entity';

// Pharmaceutical distributors used to seed the supplier directory. These are
// well-known generic medicine wholesalers so the data feels realistic.
const SUPPLIER_SEED = [
  {
    company_name: 'MediSource Pharmaceuticals Ltd.',
    contact_email: 'orders@medisource-pharma.com',
    contact_phone: '+1-202-555-0144',
    address: '24 Wellness Park, Distribution Hub, Boston, MA 02118',
    notes: 'Primary wholesaler for antibiotics, analgesics and cold & flu lines.',
  },
  {
    company_name: 'GlobalMeds Distribution Inc.',
    contact_email: 'supply@globalmeds.com',
    contact_phone: '+1-312-555-0178',
    address: '105 Pharma Avenue, Chicago, IL 60607',
    notes: 'Cardiovascular, diabetes and chronic-care medication distributor.',
  },
  {
    company_name: 'CarePlus Healthcare Supplies',
    contact_email: 'procurement@careplus-health.com',
    contact_phone: '+1-415-555-0190',
    address: '88 Medical Drive, San Francisco, CA 94107',
    notes: 'OTC supplements, vitamins, baby care and first-aid products.',
  },
  {
    company_name: 'Wellness Pharma Wholesale',
    contact_email: 'desk@wellnesspharma.com',
    contact_phone: '+1-646-555-0123',
    address: '301 Health Tower, New York, NY 10001',
    notes: 'Dermatology, skincare and personal-care medicine supplier.',
  },
];

const BRANCH_SEED = [
  {
    code: 'PHARM-HQ',
    name: 'PharmSy-Care Central Pharmacy',
    city: 'Boston',
    address: '120 Main Street, Downtown, Boston, MA 02108',
    phone: '+1-202-555-0100',
    email: 'central@pharmsycare.com',
    manager_name: 'Dr. Olivia Bennett',
    is_main: true,
  },
  {
    code: 'PHARM-NTH',
    name: 'PharmSy-Care Northside Branch',
    city: 'Cambridge',
    address: '45 Harvard Square, Cambridge, MA 02138',
    phone: '+1-202-555-0102',
    email: 'northside@pharmsycare.com',
    manager_name: 'James Carter',
    is_main: false,
  },
  {
    code: 'PHARM-WST',
    name: 'PharmSy-Care Westgate Branch',
    city: 'Brighton',
    address: '210 Western Ave, Brighton, MA 02135',
    phone: '+1-202-555-0103',
    email: 'westgate@pharmsycare.com',
    manager_name: 'Sophia Nguyen',
    is_main: false,
  },
  {
    code: 'PHARM-STH',
    name: 'PharmSy-Care Southport Branch',
    city: 'Quincy',
    address: '15 Hancock St, Quincy, MA 02169',
    phone: '+1-202-555-0104',
    email: 'southport@pharmsycare.com',
    manager_name: 'Daniel Foster',
    is_main: false,
  },
];

// Visual floor-map shelves for the shelf-location module. Coordinates power the
// grid renderer; colours tint each zone.
const SHELF_SEED = [
  { code: 'A1', name: 'Pain Relief & Analgesics', zone: 'Front Aisle', aisle: 'A', row_index: 0, column_index: 0, color: '#2563eb', capacity: 120 },
  { code: 'A2', name: 'Cold, Cough & Flu', zone: 'Front Aisle', aisle: 'A', row_index: 0, column_index: 1, color: '#0ea5e9', capacity: 120 },
  { code: 'B1', name: 'Antibiotics (Rx)', zone: 'Pharmacy Counter', aisle: 'B', row_index: 1, column_index: 0, color: '#dc2626', capacity: 80 },
  { code: 'B2', name: 'Cardiovascular & Diabetes', zone: 'Pharmacy Counter', aisle: 'B', row_index: 1, column_index: 1, color: '#db2777', capacity: 80 },
  { code: 'C1', name: 'Vitamins & Supplements', zone: 'Wellness Aisle', aisle: 'C', row_index: 2, column_index: 0, color: '#16a34a', capacity: 150 },
  { code: 'C2', name: 'Baby & Mother Care', zone: 'Wellness Aisle', aisle: 'C', row_index: 2, column_index: 1, color: '#f59e0b', capacity: 150 },
  { code: 'D1', name: 'Skin & Dermatology', zone: 'Personal Care', aisle: 'D', row_index: 3, column_index: 0, color: '#7c3aed', capacity: 100 },
  { code: 'D2', name: 'First Aid & Devices', zone: 'Personal Care', aisle: 'D', row_index: 3, column_index: 1, color: '#0d9488', capacity: 100 },
];

@Injectable()
export class PharmacySeederService {
  private readonly logger = new Logger(PharmacySeederService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(ProductSupplier)
    private readonly productSupplierRepository: Repository<ProductSupplier>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchInventory)
    private readonly branchInventoryRepository: Repository<BranchInventory>,
    @InjectRepository(ShelfLocation)
    private readonly shelfLocationRepository: Repository<ShelfLocation>,
    @InjectRepository(ProductShelfLocation)
    private readonly productShelfLocationRepository: Repository<ProductShelfLocation>,
    @InjectRepository(ReorderRequest)
    private readonly reorderRequestRepository: Repository<ReorderRequest>,
    @InjectRepository(GoodsReceivedNote)
    private readonly grnRepository: Repository<GoodsReceivedNote>,
    @InjectRepository(GrnItem)
    private readonly grnItemRepository: Repository<GrnItem>,
    @InjectRepository(ProcurementRecord)
    private readonly procurementRepository: Repository<ProcurementRecord>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('💊 Seeding pharmacy modules (suppliers, branches, shelves, procurement, prescriptions)...');

    const products = await this.productRepository.find({
      order: { id: 'ASC' },
      take: 40,
    });

    if (!products.length) {
      this.logger.warn('⚠️  No products found. Run the products seeder first; skipping pharmacy seed.');
      return;
    }

    const shops = await this.shopRepository.find({ order: { id: 'ASC' } });
    const users = await this.userRepository.find({ order: { id: 'ASC' } });

    const hasPermission = (user: User, permission: Permission) =>
      (user.permissions ?? []).some((p) => `${p}` === `${permission}`);

    const admin =
      users.find((u) => hasPermission(u, Permission.SUPER_ADMIN)) ?? users[0];
    const vendors = users.filter((u) => hasPermission(u, Permission.BRANCH_OWNER));
    const customers = users.filter((u) => hasPermission(u, Permission.CUSTOMER));

    await this.clear();

    const suppliers = await this.seedSuppliers(users, vendors, admin);
    await this.seedProductSuppliers(products, suppliers);
    const branches = await this.seedBranches(vendors, admin);
    await this.seedBranchInventory(branches, products);
    const shelves = await this.seedShelfLocations();
    await this.seedProductShelfLocations(shelves, products);
    const reorderRequests = await this.seedReorderRequests(products, suppliers, admin);
    await this.seedGoodsReceivedNotes(products, suppliers, reorderRequests, admin);
    await this.seedProcurementHistory(products, suppliers, reorderRequests);
    await this.seedPrescriptions(products, shops, customers, admin);

    this.logger.log('✅ Pharmacy modules seeded successfully');
  }

  async clear(): Promise<void> {
    // Delete in FK-safe order (children before parents).
    await this.prescriptionRepository.createQueryBuilder().delete().execute();
    await this.productShelfLocationRepository.createQueryBuilder().delete().execute();
    await this.shelfLocationRepository.createQueryBuilder().delete().execute();
    await this.branchInventoryRepository.createQueryBuilder().delete().execute();
    await this.branchRepository.createQueryBuilder().delete().execute();
    await this.grnItemRepository.createQueryBuilder().delete().execute();
    await this.grnRepository.createQueryBuilder().delete().execute();
    await this.procurementRepository.createQueryBuilder().delete().execute();
    await this.reorderRequestRepository.createQueryBuilder().delete().execute();
    await this.productSupplierRepository.createQueryBuilder().delete().execute();
    await this.supplierRepository.createQueryBuilder().delete().execute();
  }

  private async seedSuppliers(
    users: User[],
    vendors: User[],
    admin: User,
  ): Promise<Supplier[]> {
    const ownerPool = vendors.length ? vendors : users.length ? users : [admin];
    const saved: Supplier[] = [];

    for (let i = 0; i < SUPPLIER_SEED.length; i++) {
      const seed = SUPPLIER_SEED[i];
      const owner = ownerPool[i % ownerPool.length] ?? admin;
      const supplier = this.supplierRepository.create({
        user_id: owner.id,
        company_name: seed.company_name,
        contact_email: seed.contact_email,
        contact_phone: seed.contact_phone,
        address: seed.address,
        notes: seed.notes,
        is_active: true,
      });
      saved.push(await this.supplierRepository.save(supplier));
    }

    this.logger.log(`   • ${saved.length} suppliers`);
    return saved;
  }

  private async seedProductSuppliers(
    products: Product[],
    suppliers: Supplier[],
  ): Promise<void> {
    if (!suppliers.length) return;
    const mappings: ProductSupplier[] = [];

    products.slice(0, 24).forEach((product, index) => {
      const supplier = suppliers[index % suppliers.length];
      mappings.push(
        this.productSupplierRepository.create({
          product_id: product.id,
          supplier_id: supplier.id,
          reorder_quantity: 50 + (index % 5) * 25,
        }),
      );
    });

    await this.productSupplierRepository.save(mappings);
    this.logger.log(`   • ${mappings.length} product-supplier mappings`);
  }

  private async seedBranches(vendors: User[], admin: User): Promise<Branch[]> {
    const saved: Branch[] = [];

    for (let i = 0; i < BRANCH_SEED.length; i++) {
      const seed = BRANCH_SEED[i];
      const vendor = vendors.length ? vendors[i % vendors.length] : admin;
      const branch = this.branchRepository.create({
        ...seed,
        is_active: true,
        vendor_id: vendor ? vendor.id : null,
      });
      saved.push(await this.branchRepository.save(branch));
    }

    this.logger.log(`   • ${saved.length} branches`);
    return saved;
  }

  private async seedBranchInventory(
    branches: Branch[],
    products: Product[],
  ): Promise<void> {
    if (!branches.length) return;
    const inventory: BranchInventory[] = [];
    const catalogue = products.slice(0, 18);

    branches.forEach((branch, branchIndex) => {
      catalogue.forEach((product, productIndex) => {
        // Vary stock per branch so cross-branch availability looks realistic;
        // the main branch keeps the deepest stock.
        const base = branch.is_main ? 80 : 25;
        const quantity = Math.max(
          0,
          base + ((productIndex * 7 + branchIndex * 13) % 60) - (productIndex % 3) * 12,
        );
        inventory.push(
          this.branchInventoryRepository.create({
            branch_id: branch.id,
            product_id: product.id,
            quantity,
            reorder_level: 15,
            price: product.price ?? null,
            product_name: product.name,
            product_sku: product.sku ?? null,
            product_slug: product.slug,
            product_image: product.image ?? null,
          }),
        );
      });
    });

    await this.branchInventoryRepository.save(inventory);
    this.logger.log(`   • ${inventory.length} branch inventory records`);
  }

  private async seedShelfLocations(): Promise<ShelfLocation[]> {
    const saved: ShelfLocation[] = [];
    for (const seed of SHELF_SEED) {
      const shelf = this.shelfLocationRepository.create({
        ...seed,
        description: `${seed.name} — ${seed.zone}, aisle ${seed.aisle}.`,
        is_active: true,
      });
      saved.push(await this.shelfLocationRepository.save(shelf));
    }
    this.logger.log(`   • ${saved.length} shelf locations`);
    return saved;
  }

  private async seedProductShelfLocations(
    shelves: ShelfLocation[],
    products: Product[],
  ): Promise<void> {
    if (!shelves.length) return;
    const mappings: ProductShelfLocation[] = [];

    products.slice(0, 24).forEach((product, index) => {
      const shelf = shelves[index % shelves.length];
      mappings.push(
        this.productShelfLocationRepository.create({
          product_id: product.id,
          shelf_location_id: shelf.id,
          bin: `Bin ${1 + (index % 6)}`,
          product_name: product.name,
          product_sku: product.sku ?? null,
          product_slug: product.slug,
          product_image: product.image ?? null,
          note: `Stored on shelf ${shelf.code}.`,
        }),
      );
    });

    await this.productShelfLocationRepository.save(mappings);
    this.logger.log(`   • ${mappings.length} product shelf-location mappings`);
  }

  private async seedReorderRequests(
    products: Product[],
    suppliers: Supplier[],
    admin: User,
  ): Promise<ReorderRequest[]> {
    if (!suppliers.length) return [];
    const statuses = [
      ReorderRequestStatus.PENDING,
      ReorderRequestStatus.NOTIFIED,
      ReorderRequestStatus.ACKNOWLEDGED,
      ReorderRequestStatus.FULFILLED,
      ReorderRequestStatus.PENDING,
      ReorderRequestStatus.CANCELLED,
    ];
    const saved: ReorderRequest[] = [];

    products.slice(0, statuses.length).forEach((product, index) => {
      const supplier = suppliers[index % suppliers.length];
      const status = statuses[index];
      const currentStock = 4 + (index % 5);
      const notified =
        status === ReorderRequestStatus.PENDING ? null : new Date();
      saved.push(
        this.reorderRequestRepository.create({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku ?? null,
          shop_id: null,
          supplier_id: supplier.id,
          requested_quantity: 100,
          current_stock: currentStock,
          current_quantity: currentStock,
          is_automated: index % 2 === 0,
          created_by: admin ? admin.id : null,
          notes:
            status === ReorderRequestStatus.CANCELLED
              ? 'Cancelled — alternative supplier used.'
              : `Auto-generated low-stock alert for ${product.name}.`,
          status,
          notification_channel: ReorderNotificationChannel.BOTH,
          notification_message: `Please restock ${product.name} (current stock ${currentStock}).`,
          notified_at: notified,
        }),
      );
    });

    const result = await this.reorderRequestRepository.save(saved);
    this.logger.log(`   • ${result.length} reorder requests`);
    return result;
  }

  private async seedGoodsReceivedNotes(
    products: Product[],
    suppliers: Supplier[],
    reorderRequests: ReorderRequest[],
    admin: User,
  ): Promise<void> {
    if (!suppliers.length) return;
    const catalogue = products.slice(0, 16);
    const grnCount = 4;

    for (let i = 0; i < grnCount; i++) {
      const supplier = suppliers[i % suppliers.length];
      const items = catalogue.slice(i * 3, i * 3 + 3).map((product, idx) => {
        const ordered = 60 + idx * 20;
        const received = i === grnCount - 1 ? ordered - 5 : ordered;
        const unitCost = Number(((product.price ?? 10) * 0.6).toFixed(2));
        return this.grnItemRepository.create({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku ?? null,
          ordered_quantity: ordered,
          received_quantity: received,
          unit_cost: unitCost,
          total_cost: Number((unitCost * received).toFixed(2)),
        });
      });

      if (!items.length) continue;

      const totalQuantity = items.reduce((sum, it) => sum + it.received_quantity, 0);
      const totalCost = items.reduce((sum, it) => sum + Number(it.total_cost ?? 0), 0);
      const status = i === 0 ? GrnStatus.DRAFT : GrnStatus.RECEIVED;

      const grn = this.grnRepository.create({
        grn_number: `GRN-2026-${String(1001 + i)}`,
        supplier_id: supplier.id,
        supplier_name: supplier.company_name,
        reorder_request_id: reorderRequests[i] ? reorderRequests[i].id : null,
        invoice_number: `INV-${supplier.id}-${2000 + i}`,
        status,
        notes:
          status === GrnStatus.DRAFT
            ? 'Awaiting physical verification at the counter.'
            : 'Stock received and shelved.',
        received_by: admin ? admin.id : null,
        received_at: status === GrnStatus.RECEIVED ? new Date() : null,
        total_quantity: totalQuantity,
        total_cost: Number(totalCost.toFixed(2)),
        items,
      });

      await this.grnRepository.save(grn);
    }

    this.logger.log(`   • ${grnCount} goods received notes (with items)`);
  }

  private async seedProcurementHistory(
    products: Product[],
    suppliers: Supplier[],
    reorderRequests: ReorderRequest[],
  ): Promise<void> {
    if (!suppliers.length) return;
    const records: ProcurementRecord[] = [];
    const catalogue = products.slice(0, 12);

    catalogue.forEach((product, index) => {
      const supplier = suppliers[index % suppliers.length];
      const status =
        index % 3 === 0
          ? ProcurementStatus.ORDERED
          : index % 3 === 1
          ? ProcurementStatus.RECEIVED
          : ProcurementStatus.RECEIVED;
      const quantity = 80 + (index % 4) * 20;
      const unitCost = Number(((product.price ?? 10) * 0.6).toFixed(2));
      const orderedAt = new Date();
      orderedAt.setDate(orderedAt.getDate() - (index + 1) * 5);
      const receivedAt =
        status === ProcurementStatus.RECEIVED
          ? new Date(orderedAt.getTime() + 3 * 24 * 60 * 60 * 1000)
          : null;

      records.push(
        this.procurementRepository.create({
          reorder_request_id: reorderRequests[index]
            ? reorderRequests[index].id
            : null,
          supplier_id: supplier.id,
          supplier_name: supplier.company_name,
          product_id: product.id,
          product_name: product.name,
          sku: product.sku ?? null,
          quantity,
          unit_cost: unitCost,
          total_cost: Number((unitCost * quantity).toFixed(2)),
          status,
          notes: `Procurement of ${product.name} from ${supplier.company_name}.`,
          ordered_at: orderedAt,
          received_at: receivedAt,
        }),
      );
    });

    await this.procurementRepository.save(records);
    this.logger.log(`   • ${records.length} procurement history records`);
  }

  private async seedPrescriptions(
    products: Product[],
    shops: Shop[],
    customers: User[],
    admin: User,
  ): Promise<void> {
    if (!customers.length) {
      this.logger.warn('   • No customer users found; skipping prescriptions.');
      return;
    }

    const shopId = shops.length ? shops[0].id : null;
    const statuses = [
      PrescriptionStatus.PENDING,
      PrescriptionStatus.APPROVED,
      PrescriptionStatus.FULFILLED,
      PrescriptionStatus.REJECTED,
      PrescriptionStatus.PENDING,
      PrescriptionStatus.APPROVED,
    ];
    const sampleImages = [
      'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/903/prescription-sample-1.jpg',
      'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/903/prescription-sample-2.jpg',
    ];

    const saved: Prescription[] = [];

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const customer = customers[i % customers.length];
      const medsSource = products.slice(i * 2, i * 2 + 2);
      const medicines = (medsSource.length ? medsSource : products.slice(0, 2)).map(
        (product) => ({
          product_id: product.id,
          name: product.name,
          quantity: 1 + (product.id % 3),
          price: product.price ?? undefined,
          image: (product.image as any)?.thumbnail ?? (product.image as any)?.original,
        }),
      );

      const isProcessed =
        status === PrescriptionStatus.APPROVED ||
        status === PrescriptionStatus.FULFILLED ||
        status === PrescriptionStatus.REJECTED;

      saved.push(
        this.prescriptionRepository.create({
          image_url: sampleImages[i % sampleImages.length],
          attachment_id: `seed_rx_${1000 + i}`,
          notes:
            i % 2 === 0
              ? 'Please prepare for pickup this afternoon.'
              : 'Home delivery requested if possible.',
          medicines,
          admin_notes: isProcessed
            ? status === PrescriptionStatus.REJECTED
              ? 'Prescription image is unclear, please re-upload.'
              : 'Verified against doctor signature and dosage.'
            : null,
          status,
          customer_id: customer.id,
          shop_id: shopId,
          processed_by: isProcessed && admin ? admin.id : null,
          rejection_reason:
            status === PrescriptionStatus.REJECTED
              ? 'Illegible prescription — could not confirm dosage.'
              : null,
          processed_at: isProcessed ? new Date() : null,
        } as Partial<Prescription>),
      );
    }

    await this.prescriptionRepository.save(saved);
    this.logger.log(`   • ${saved.length} prescriptions`);
  }
}
