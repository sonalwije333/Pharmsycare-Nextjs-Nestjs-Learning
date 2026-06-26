// store-notices/store-notices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Permission } from 'src/common/enums/enums';
import { StoreNotice } from './entities/store-notices.entity';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { GetStoreNoticesDto, StoreNoticePaginator } from './dto/get-store-notices.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { GetUsersDto, UserPaginator } from 'src/users/dto/get-users.dto';
import usersJson from '@db/users.json';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class StoreNoticesService {
  private users: User[] = plainToClass(User, usersJson);

  constructor(
    @InjectRepository(StoreNotice)
    private storeNoticeRepository: Repository<StoreNotice>,
  ) {}

  private normalizeReceivedBy(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).join(',');
    }

    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    return String(value);
  }

  private hasPermission(user: any, permission: Permission): boolean {
    const rawPermissions = user?.permissions;
    if (!rawPermissions) {
      return false;
    }

    if (Array.isArray(rawPermissions)) {
      return rawPermissions.some((item: any) => {
        if (typeof item === 'string') {
          return item === permission;
        }
        return item?.name === permission;
      });
    }

    if (typeof rawPermissions === 'string') {
      return rawPermissions.includes(permission);
    }

    return false;
  }

  private getCreatorRole(createdBy?: string): string {
    const creatorId = Number(createdBy);

    if (Number.isNaN(creatorId)) {
      return 'System';
    }

    const creator = this.users.find((user) => user.id === creatorId);
    return creator?.name || 'System';
  }

  async create(createStoreNoticeDto: CreateStoreNoticeDto): Promise<StoreNotice> {
    const normalizedReceivedBy = this.normalizeReceivedBy(
      createStoreNoticeDto.received_by,
    );

    const newStoreNotice = this.storeNoticeRepository.create({
      notice: createStoreNoticeDto.notice,
      description: createStoreNoticeDto.description,
      effective_from: createStoreNoticeDto.effective_from,
      expired_at: createStoreNoticeDto.expired_at,
      priority: createStoreNoticeDto.priority,
      type: createStoreNoticeDto.type || 'all_vendor',
      received_by: normalizedReceivedBy,
      created_by: '1',
      is_read: false,
    });

    return this.storeNoticeRepository.save(newStoreNotice);
  }

  async getStoreNotices({
    search,
    limit = 10,
    page = 1,
    priority,
    type,
    user_id,
    sortedBy = 'desc',
    orderBy = 'created_at'
  }: GetStoreNoticesDto): Promise<StoreNoticePaginator> {
    let data: StoreNotice[] = await this.storeNoticeRepository.find();

    // Populate creator_role from user data
    data = data.map((notice) => ({
      ...notice,
      creator_role: this.getCreatorRole(notice.created_by),
    }));

    let noticeSearch: string | undefined;
    let plainSearch: string | undefined;

    if (search) {
      const tokens = search
        .split(';')
        .map((token) => token.trim())
        .filter(Boolean);

      const plainTerms: string[] = [];

      for (const token of tokens) {
        const separatorIndex = token.indexOf(':');
        if (separatorIndex === -1) {
          plainTerms.push(token);
          continue;
        }

        const key = token.slice(0, separatorIndex).trim();
        const value = token.slice(separatorIndex + 1).trim();
        if (!value) {
          continue;
        }

        if (key === 'notice') {
          noticeSearch = value;
        } else {
          plainTerms.push(value);
        }
      }

      if (!noticeSearch && plainTerms.length > 0) {
        plainSearch = plainTerms.join(' ');
      }
    }

    // Apply filters
    if (priority) {
      data = data.filter(notice => notice.priority === priority);
    }

    if (type) {
      data = data.filter(notice => notice.type === type);
    }

    if (noticeSearch) {
      const fuse = new Fuse(data, {
        keys: ['notice'],
        threshold: 0.3,
      });
      data = fuse.search(noticeSearch)?.map(({ item }) => item);
    } else if (plainSearch) {
      const fuse = new Fuse(data, {
        keys: ['notice', 'description'],
        threshold: 0.3,
      });
      data = fuse.search(plainSearch)?.map(({ item }) => item);
    }

    // Apply sorting
    const sortField = (orderBy || 'created_at').toLowerCase();
    const sortDirection = (sortedBy || 'desc').toUpperCase();
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'notice':
          aValue = a.notice;
          bValue = b.notice;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'expire_at':
          aValue = new Date(a.expired_at).getTime();
          bValue = new Date(b.expired_at).getTime();
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

      if (sortDirection === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/store-notices?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getUsersToNotify({ limit = 10, page = 1 }: GetUsersDto): Promise<UserPaginator> {
    const usersToNotify = this.users.filter(
      (user) =>
        this.hasPermission(user, Permission.STORE_OWNER) ||
        this.hasPermission(user, Permission.SUPER_ADMIN),
    );

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = usersToNotify.slice(startIndex, endIndex);

    const url = `/store-notices/users-to-notify?limit=${limit}`;
    const paginationInfo = paginate(usersToNotify.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getStoreNotice(id: number): Promise<StoreNotice> {
    const storeNotice = await this.storeNoticeRepository.findOneBy({ id });
    
    if (!storeNotice) {
      throw new NotFoundException('Store notice not found');
    }
    
    // Populate creator_role from user data
    storeNotice.creator_role = this.getCreatorRole(storeNotice.created_by);
    
    return storeNotice;
  }

  async update(id: number, updateStoreNoticeDto: UpdateStoreNoticeDto): Promise<StoreNotice> {
    const storeNotice = await this.storeNoticeRepository.findOneBy({ id });
    
    if (!storeNotice) {
      throw new NotFoundException('Store notice not found');
    }

    const normalizedReceivedBy = this.normalizeReceivedBy(
      updateStoreNoticeDto.received_by,
    );

    const updatedNotice = this.storeNoticeRepository.merge(storeNotice, {
      ...updateStoreNoticeDto,
      received_by: normalizedReceivedBy,
      updated_by: '1',
    });

    return this.storeNoticeRepository.save(updatedNotice);
  }

  async markAsRead(id: number): Promise<CoreMutationOutput> {
    const storeNotice = await this.storeNoticeRepository.findOneBy({ id });
    
    if (!storeNotice) {
      throw new NotFoundException('Store notice not found');
    }

    storeNotice.is_read = true;
    await this.storeNoticeRepository.save(storeNotice);
    
    return {
      success: true,
      message: 'Store notice marked as read successfully'
    };
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const storeNotice = await this.storeNoticeRepository.findOneBy({ id });
    
    if (!storeNotice) {
      throw new NotFoundException('Store notice not found');
    }

    await this.storeNoticeRepository.remove(storeNotice);
    
    return {
      success: true,
      message: 'Store notice deleted successfully'
    };
  }
}