import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Permission } from './entities/user.entity';
import { paginate } from '../common/pagination/paginate';
import * as bcrypt from 'bcrypt';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import { QueryUsersOrderByColumn } from '../../common/enums/enums';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, permission } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
      relations: ['permissions'],
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with permissions
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      is_active: true,
    });

    // Save user first
    const savedUser = await this.userRepository.save(user);

    // Create permission if specified
    if (permission) {
      const newPermission = this.permissionRepository.create({
        name: permission,
        guard_name: 'api',
        user: savedUser,
      });
      await this.permissionRepository.save(newPermission);

      // Add permission to user's permissions array
      savedUser.permissions = [newPermission];
    }

    return savedUser;
  }

  async getUsers(getUsersDto: GetUsersDto): Promise<UserPaginator> {
    // Provide default values for page and limit
    const page = getUsersDto.page ?? 1;
    const limit = getUsersDto.limit ?? 10;
    const sortedBy = getUsersDto.sortedBy ?? SortOrder.DESC;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where conditions
    const where: any = {};

    if (getUsersDto.text) {
      where.name = ILike(`%${getUsersDto.text}%`);
    }

    if (getUsersDto.search) {
      const searchParams = getUsersDto.search.split(';');
      for (const searchParam of searchParams) {
        const [key, value] = searchParam.split(':');
        if (key && value) {
          where[key] = ILike(`%${value}%`);
        }
      }
    }

    // Build order by
    let order: any = { created_at: 'DESC' }; // Default order
    if (getUsersDto.orderBy && sortedBy) {
      order = {};
      const orderField = this.getOrderByField(getUsersDto.orderBy);
      order[orderField] = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    }

    // Get users with pagination
    const [data, total] = await this.userRepository.findAndCount({
      where,
      relations: ['permissions', 'profile'],
      skip,
      take,
      order,
    });

    const url = `/users?limit=${limit}&page=${page}`;

    return {
      data,
      ...paginate(total, page, limit, data.length, url),
    };
  }

  private getOrderByField(orderBy: QueryUsersOrderByColumn): string {
    switch (orderBy) {
      case QueryUsersOrderByColumn.NAME:
        return 'name';
      case QueryUsersOrderByColumn.CREATED_AT:
        return 'created_at';
      case QueryUsersOrderByColumn.UPDATED_AT:
        return 'updated_at';
      case QueryUsersOrderByColumn.IS_ACTIVE:
        return 'is_active';
      default:
        return 'created_at';
    }
  }

  getUsersNotify(getUsersDto: GetUsersDto): Promise<User[]> {
    const limit = getUsersDto.limit ?? 10;

    return this.userRepository.find({
      relations: ['permissions', 'profile'],
      take: limit,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['permissions', 'profile', 'address'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update user properties
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      // Check if new email is already in use
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
      user.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async makeAdmin(user_id: string): Promise<User> {
    const user = await this.findOne(Number(user_id));

    // Check if user already has admin permission
    const hasAdminPermission = user.permissions?.some(
      (p) =>
        p.name === PermissionType.SUPER_ADMIN ||
        p.name === PermissionType.STORE_OWNER,
    );

    if (!hasAdminPermission) {
      const adminPermission = this.permissionRepository.create({
        name: PermissionType.STORE_OWNER,
        guard_name: 'api',
        user: user,
      });
      await this.permissionRepository.save(adminPermission);

      // Refresh user permissions
      user.permissions = [...(user.permissions || []), adminPermission];
    }

    return user;
  }

  async banUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = false;
    return this.userRepository.save(user);
  }

  async activeUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = true;
    return this.userRepository.save(user);
  }

  async getAdmin(getUsersDto: GetUsersDto): Promise<UserPaginator> {
    return this.getUsersByPermission(PermissionType.SUPER_ADMIN, getUsersDto);
  }

  async getVendors(getUsersDto: GetUsersDto): Promise<UserPaginator> {
    return this.getUsersByPermission(PermissionType.STORE_OWNER, getUsersDto);
  }

  async getAllCustomers(getUsersDto: GetUsersDto): Promise<UserPaginator> {
    return this.getUsersByPermission(PermissionType.CUSTOMER, getUsersDto);
  }

  async getMyStaffs(getUsersDto: GetUsersDto): Promise<UserPaginator> {
    return this.getUsersByPermission(PermissionType.STAFF, getUsersDto);
  }

  async getAllStaffs(getUsersDto: GetUsersDto): Promise<UserPaginator> {
    return this.getUsersByPermission(PermissionType.STAFF, getUsersDto);
  }

  private async getUsersByPermission(
    permissionType: PermissionType,
    getUsersDto: GetUsersDto,
  ): Promise<UserPaginator> {
    // Provide default values for page and limit
    const page = getUsersDto.page ?? 1;
    const limit = getUsersDto.limit ?? 10;
    const sortedBy = getUsersDto.sortedBy ?? SortOrder.DESC;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build query
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('permissions.name = :permissionType', { permissionType })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .skip(skip)
      .take(take);

    // Add order by
    if (getUsersDto.orderBy && sortedBy) {
      const orderField = this.getOrderByField(getUsersDto.orderBy);
      const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`user.${orderField}`, orderDirection);
    } else {
      queryBuilder.orderBy('user.created_at', 'DESC');
    }

    // Add text search
    if (getUsersDto.text) {
      queryBuilder.andWhere(
        '(user.name ILIKE :text OR user.email ILIKE :text)',
        {
          text: `%${getUsersDto.text}%`,
        },
      );
    }

    // Add advanced search
    if (getUsersDto.search) {
      const searchParams = getUsersDto.search.split(';');
      for (const searchParam of searchParams) {
        const [key, value] = searchParam.split(':');
        if (key && value) {
          if (key === 'name' || key === 'email') {
            queryBuilder.andWhere(`user.${key} ILIKE :${key}`, {
              [key]: `%${value}%`,
            });
          }
        }
      }
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const url = `/users?permission=${permissionType}&limit=${limit}&page=${page}`;

    return {
      data,
      ...paginate(total, page, limit, data.length, url),
    };
  }

  async createProfile(userId: number, createProfileDto: any): Promise<User> {
    const user = await this.findOne(userId);
    return user;
  }

  async updateProfile(userId: number, updateProfileDto: any): Promise<User> {
    const user = await this.findOne(userId);
    return user;
  }

  async removeProfile(id: number): Promise<void> {
    // Profile deletion logic would go here
  }

  // Additional utility methods
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions'],
    });

    return user?.permissions || [];
  }

  async hasPermission(
    userId: number,
    permission: PermissionType,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some((p) => p.name === permission);
  }

  async addPermission(
    userId: number,
    permissionType: PermissionType,
  ): Promise<User> {
    const user = await this.findOne(userId);

    // Check if permission already exists
    const existingPermission = user.permissions?.find(
      (p) => p.name === permissionType,
    );
    if (!existingPermission) {
      const newPermission = this.permissionRepository.create({
        name: permissionType,
        guard_name: 'api',
        user: user,
      });
      await this.permissionRepository.save(newPermission);

      // Refresh user permissions
      user.permissions = [...(user.permissions || []), newPermission];
    }

    return user;
  }

  async removePermission(
    userId: number,
    permissionType: PermissionType,
  ): Promise<User> {
    const user = await this.findOne(userId);

    // Find and remove permission
    const permissionToRemove = user.permissions?.find(
      (p) => p.name === permissionType,
    );
    if (permissionToRemove) {
      await this.permissionRepository.remove(permissionToRemove);

      // Refresh user permissions
      user.permissions =
        user.permissions?.filter((p) => p.name !== permissionType) || [];
    }

    return user;
  }
}
