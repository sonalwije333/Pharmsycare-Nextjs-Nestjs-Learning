// users/users.service.ts (fixed version)
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto, UpdateProfileDto } from './dto/create-profile.dto';
import { AddStaffDto } from './dto/add-staff.dto';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Permission } from '../common/enums/enums';
import { paginate } from 'src/common/pagination/paginate';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { profile, address, permission, ...userData } = createUserDto;
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      permissions: [permission || Permission.CUSTOMER],
      is_active: true,
    });

    const savedUser = await this.usersRepository.save(user);
    
    // Create profile if provided
    if (profile && profile.customer) {
      const newProfile = this.profileRepository.create({
        avatar: profile.avatar,
        bio: profile.bio,
        socials: profile.socials,
        contact: profile.contact,
        customer: savedUser
      });
      await this.profileRepository.save(newProfile);
    }
    
    return this.findOne(savedUser.id);
  }

  async addStaff(addStaffDto: AddStaffDto): Promise<User> {
    const { email, password, name, shop_id } = addStaffDto;
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      permissions: [Permission.STAFF],
      is_active: true,
    });

    const savedUser = await this.usersRepository.save(user);
    
    // Here you would also create the staff-shop relationship
    // This depends on your Shop entity implementation
    
    return this.findOne(savedUser.id);
  }

  async getUsers({
    text,
    limit = 30,
    page = 1,
    search,
    orderBy = 'created_at',
    sortedBy = 'DESC',
  }: GetUsersDto): Promise<UserPaginator> {
    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (text) {
      query.where('user.name LIKE :text OR user.email LIKE :text', {
        text: `%${text}%`,
      });
    }

    if (search) {
      const searchParams = search.split(';');
      searchParams.forEach(param => {
        const [key, value] = param.split(':');
        if (key && value) {
          if (key === 'permissions') {
            query.andWhere(`user.permissions LIKE :${key}`, { [key]: `%${value}%` });
          } else {
            query.andWhere(`user.${key} = :${key}`, { [key]: value });
          }
        }
      });
    }

    const direction = (sortedBy || 'DESC').toUpperCase();
    query.orderBy(
      `user.${orderBy}`,
      (direction === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC'
    );
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    const url = `/users?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile', 'address'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { profile, address, permission, ...userData } = updateUserDto;
    
    const user = await this.findOne(id);
    
    // Update user fields
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    Object.assign(user, userData);
    
    if (permission) {
      user.permissions = [permission];
    }
    
    await this.usersRepository.save(user);
    
    // Update profile if provided
    if (profile) {
      if (user.profile) {
        // Update existing profile
        const profileUpdateData: any = {};
        
        if (profile.avatar !== undefined) profileUpdateData.avatar = profile.avatar;
        if (profile.bio !== undefined) profileUpdateData.bio = profile.bio;
        if (profile.socials !== undefined) profileUpdateData.socials = profile.socials;
        if (profile.contact !== undefined) profileUpdateData.contact = profile.contact;
        
        if (Object.keys(profileUpdateData).length > 0) {
          await this.profileRepository.update(user.profile.id, profileUpdateData);
        }
        
        // Update customer relation if provided
        if (profile.customer) {
          const newCustomer = await this.findOne(profile.customer.connect);
          user.profile.customer = newCustomer;
          await this.profileRepository.save(user.profile);
        }
      } else if (profile.customer) {
        // Create new profile
        const newProfile = this.profileRepository.create({
          avatar: profile.avatar,
          bio: profile.bio,
          socials: profile.socials,
          contact: profile.contact,
          customer: user
        });
        await this.profileRepository.save(newProfile);
      }
    }
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const user = await this.findOne(id);
    
    // Delete associated profile first if exists
    if (user.profile) {
      await this.profileRepository.delete(user.profile.id);
    }
    
    await this.usersRepository.delete(id);
    
    return {
      success: true,
      message: `User with ID ${id} deleted successfully`,
    };
  }

  async createProfile(createProfileDto: CreateProfileDto): Promise<Profile> {
    const { customer, ...profileData } = createProfileDto;
    
    const user = await this.findOne(customer.connect);
    
    // Check if profile already exists
    if (user.profile) {
      throw new ConflictException('User already has a profile');
    }
    
    const profile = this.profileRepository.create({
      ...profileData,
      customer: user
    });
    
    return this.profileRepository.save(profile);
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['customer']
    });
    
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    
    // Update profile fields
    if (updateProfileDto.avatar !== undefined) profile.avatar = updateProfileDto.avatar;
    if (updateProfileDto.bio !== undefined) profile.bio = updateProfileDto.bio;
    if (updateProfileDto.socials !== undefined) profile.socials = updateProfileDto.socials;
    if (updateProfileDto.contact !== undefined) profile.contact = updateProfileDto.contact;
    
    // Update customer relation if provided
    if (updateProfileDto.customer) {
      const user = await this.findOne(updateProfileDto.customer.connect);
      profile.customer = user;
    }
    
    return this.profileRepository.save(profile);
  }

  async deleteProfile(id: number): Promise<CoreMutationOutput> {
    const profile = await this.profileRepository.findOne({
      where: { id }
    });
    
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    
    await this.profileRepository.delete(id);
    
    return {
      success: true,
      message: `Profile with ID ${id} deleted successfully`,
    };
  }

  async makeAdmin(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    
    if (!user.permissions?.includes(Permission.SUPER_ADMIN)) {
      user.permissions = [...(user.permissions || []), Permission.SUPER_ADMIN];
    }
    
    return this.usersRepository.save(user);
  }

  async banUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = false;
    return this.usersRepository.save(user);
  }

  async activeUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = true;
    return this.usersRepository.save(user);
  }

  async getAdmin({
    text,
    name,
    limit = 30,
    page = 1,
  }: GetUsersDto): Promise<UserPaginator> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where("user.permissions LIKE '%super_admin%'");

    const searchText = text || name;
    if (searchText) {
      query.andWhere('(user.name LIKE :text OR user.email LIKE :text)', {
        text: `%${searchText}%`,
      });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/admin/list?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async getVendors({
    text,
    name,
    is_active,
    limit = 30,
    page = 1,
  }: GetUsersDto): Promise<UserPaginator> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where("user.permissions LIKE '%store_owner%'");

    const searchText = text || name;
    if (searchText) {
      query.andWhere('(user.name LIKE :text OR user.email LIKE :text)', {
        text: `%${searchText}%`,
      });
    }

    if (is_active !== undefined) {
      query.andWhere('user.is_active = :is_active', { is_active });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/vendors/list?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async getAllCustomers({
    text,
    name,
    search,
    is_active,
    limit = 30,
    page = 1,
  }: GetUsersDto): Promise<UserPaginator> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.permissions = :permission', { permission: Permission.CUSTOMER });

    const searchText = text || name;
    if (searchText) {
      query.andWhere('(user.name LIKE :text OR user.email LIKE :text)', {
        text: `%${searchText}%`,
      });
    }

    if (search) {
      const searchParams = search.split(';');
      searchParams.forEach(param => {
        const [key, value] = param.split(':');
        if (key && value) {
          if (key === 'permissions') {
            query.andWhere(`user.permissions LIKE :${key}`, { [key]: `%${value}%` });
          } else {
            query.andWhere(`user.${key} = :${key}`, { [key]: value });
          }
        }
      });
    }

    if (is_active !== undefined) {
      query.andWhere('user.is_active = :is_active', { is_active });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/customers/list?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async getMyStaffs({
    text,
    limit = 30,
    page = 1,
  }: GetUsersDto): Promise<UserPaginator> {
    // This should be filtered by the current store owner's shop
    // For now, returning all staff
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where("user.permissions LIKE '%staff%'");

    if (text) {
      query.andWhere('(user.name LIKE :text OR user.email LIKE :text)', {
        text: `%${text}%`,
      });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/my-staffs/list?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async getAllStaffs({
    text,
    limit = 30,
    page = 1,
  }: GetUsersDto): Promise<UserPaginator> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where("user.permissions LIKE '%staff%'");

    if (text) {
      query.andWhere('(user.name LIKE :text OR user.email LIKE :text)', {
        text: `%${text}%`,
      });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/all-staffs/list?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async getUsersNotify({ limit = 10 }: GetUsersDto): Promise<User[]> {
    return this.usersRepository.find({
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['profile'],
    });
  }

  async updateWallet(userId: number, points: number): Promise<User> {
    const user = await this.findOne(userId);
    
    if (!user.wallet) {
      user.wallet = {
        total_points: 0,
        points_used: 0,
        available_points: 0
      };
    }
    
    user.wallet.total_points = (user.wallet.total_points || 0) + points;
    user.wallet.available_points = (user.wallet.available_points || 0) + points;
    
    return this.usersRepository.save(user);
  }
}