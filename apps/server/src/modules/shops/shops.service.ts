import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Permission } from '../users/entities/user.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto } from './dto/get-shops.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { ShopPaginator } from './dto/shop-paginator.dto';
import { paginate } from '../common/pagination/paginate';
import { QueryShopsOrderByColumn } from '../../common/enums/enums';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import { PermissionType } from '../../common/enums/PermissionType.enum';
import * as bcrypt from 'bcrypt';
import { Shop } from './entites/shop.entity';
import { UserPaginator } from '../users/dto/get-users.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // ==================== SHOP METHODS ====================

  async create(createShopDto: CreateShopDto, ownerId: number): Promise<Shop> {
    const user = await this.userRepository.findOne({ where: { id: ownerId } });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    // Check if user already has a shop
    const existingShop = await this.shopRepository.findOne({
      where: { owner: { id: user.id } },
    });
    if (existingShop) {
      throw new ConflictException('User already has a shop');
    }

    // Check if slug already exists
    const slugExists = await this.shopRepository.findOne({
      where: { slug: createShopDto.slug },
    });
    if (slugExists) {
      throw new ConflictException('Shop slug already exists');
    }

    const shop = this.shopRepository.create({
      ...createShopDto,
      owner: user,
      is_active: false,
      admin_commission_rate: 0,
    });

    return await this.shopRepository.save(shop);
  }

  async getShops(getShopsDto: GetShopsDto): Promise<ShopPaginator> {
    const page = getShopsDto.page ?? 1;
    const limit = getShopsDto.limit ?? 10;
    const sortedBy = getShopsDto.sortedBy ?? SortOrder.DESC;

    const skip = (page - 1) * limit;
    const take = limit;

    const queryBuilder = this.shopRepository
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.owner', 'owner');

    // Apply filters
    if (getShopsDto.is_active !== undefined) {
      queryBuilder.andWhere('shop.is_active = :is_active', {
        is_active: getShopsDto.is_active,
      });
    }

    if (getShopsDto.text) {
      queryBuilder.andWhere('shop.name ILIKE :text', {
        text: `%${getShopsDto.text}%`,
      });
    }

    if (getShopsDto.search) {
      queryBuilder.andWhere(
        'shop.name ILIKE :search OR shop.description ILIKE :search',
        {
          search: `%${getShopsDto.search}%`,
        },
      );
    }

    // Apply ordering
    if (getShopsDto.orderBy && sortedBy) {
      const orderField = this.getOrderByField(getShopsDto.orderBy);
      queryBuilder.orderBy(
        `shop.${orderField}`,
        sortedBy === SortOrder.ASC ? 'ASC' : 'DESC',
      );
    } else {
      queryBuilder.orderBy('shop.created_at', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const url = `/shops?limit=${limit}&page=${page}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      paginatorInfo: paginationInfo,
    };
  }

  async getShopBySlug(slug: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { slug },
      relations: ['owner', 'staffs'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop with slug ${slug} not found`);
    }

    return shop;
  }

  async getShopById(id: number): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['owner', 'staffs'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    return shop;
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.getShopById(id);

    // Check if new slug already exists (if slug is being updated)
    if (updateShopDto.slug && updateShopDto.slug !== shop.slug) {
      const slugExists = await this.shopRepository.findOne({
        where: { slug: updateShopDto.slug },
      });
      if (slugExists) {
        throw new ConflictException('Shop slug already exists');
      }
    }

    Object.assign(shop, updateShopDto);
    return await this.shopRepository.save(shop);
  }

  async remove(id: number): Promise<void> {
    const shop = await this.getShopById(id);
    await this.shopRepository.remove(shop);
  }

  async approveShop(approveShopDto: ApproveShopDto): Promise<Shop> {
    const shop = await this.getShopById(parseInt(approveShopDto.id));

    shop.is_active = true;
    shop.admin_commission_rate = approveShopDto.admin_commission_rate;

    return await this.shopRepository.save(shop);
  }

  async disapproveShop(id: number): Promise<Shop> {
    const shop = await this.getShopById(id);

    shop.is_active = false;

    return await this.shopRepository.save(shop);
  }

  async getNewShops(limit: number): Promise<Shop[]> {
    return this.shopRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['owner'],
    });
  }

  async getNearbyShops(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<Shop[]> {
    if (!lat || !lng) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    // Simplified implementation - you might want to use a geospatial query with PostGIS
    return this.shopRepository.find({
      where: { is_active: true },
      relations: ['owner'],
      take: 20,
    });
  }

  private getOrderByField(orderBy: QueryShopsOrderByColumn): string {
    switch (orderBy) {
      case QueryShopsOrderByColumn.NAME:
        return 'name';
      case QueryShopsOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryShopsOrderByColumn.BALANCE:
        return 'balance';
      case QueryShopsOrderByColumn.IS_ACTIVE:
        return 'is_active';
      case QueryShopsOrderByColumn.CREATED_AT:
      default:
        return 'created_at';
    }
  }

  // ==================== STAFF METHODS ====================

  async createStaff(createStaffDto: CreateStaffDto): Promise<User> {
    const { email, password, name, shop_id, permission } = createStaffDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Check if shop exists
    const shop = await this.getShopById(shop_id);
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shop_id} not found`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      managed_shop: shop,
    });

    const savedUser = await this.userRepository.save(user);

    // Create permission for staff
    const staffPermission = this.permissionRepository.create({
      name: permission || PermissionType.STAFF,
      guard_name: 'api',
      user: savedUser,
    });
    await this.permissionRepository.save(staffPermission);

    return savedUser;
  }

  async getStaffs(getStaffsDto: GetStaffsDto): Promise<UserPaginator> {
    const page = getStaffsDto.page ?? 1;
    const limit = getStaffsDto.limit ?? 15;
    const skip = (page - 1) * limit;

    if (!getStaffsDto.shop_id) {
      throw new BadRequestException('Shop ID is required');
    }

    const shopId = parseInt(getStaffsDto.shop_id);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoin('user.managed_shop', 'shop')
      .where('shop.id = :shopId', { shopId });

    if (getStaffsDto.search) {
      queryBuilder.andWhere(
        'user.name ILIKE :search OR user.email ILIKE :search',
        {
          search: `%${getStaffsDto.search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const url = `/shops/staffs?shop_id=${getStaffsDto.shop_id}&limit=${limit}&page=${page}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async getStaffById(id: number): Promise<User> {
    const staff = await this.userRepository.findOne({
      where: { id },
      relations: ['permissions', 'profile', 'managed_shop'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    // Check if user has staff permissions
    const hasStaffPermission = staff.permissions?.some(
      (p) =>
        p.name === PermissionType.STAFF ||
        p.name === PermissionType.STORE_OWNER,
    );

    if (!hasStaffPermission) {
      throw new NotFoundException(`User with ID ${id} is not a staff member`);
    }

    return staff;
  }

  async updateStaff(id: number, updateStaffDto: UpdateStaffDto): Promise<User> {
    const staff = await this.getStaffById(id);

    // Update user properties
    if (updateStaffDto.name) staff.name = updateStaffDto.name;
    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateStaffDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
      staff.email = updateStaffDto.email;
    }
    if (updateStaffDto.password) {
      staff.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    return await this.userRepository.save(staff);
  }

  async removeStaff(id: number): Promise<void> {
    const staff = await this.getStaffById(id);
    await this.userRepository.remove(staff);
  }
}
