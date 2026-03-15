import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entites/shop.entity';
import { User } from '../users/entities/user.entity';
import { paginate } from '../common/pagination/paginate';
import { SortOrder } from '../common/dto/generic-conditions.dto';

type OwnershipTransferStatus = 'pending' | 'processing' | 'approved' | 'rejected';

type OwnershipTransferRecord = {
  id: number;
  transaction_identifier: string;
  previous_owner: User;
  current_owner: User;
  message?: string;
  status: OwnershipTransferStatus;
  shop: Shop;
  refund_info: any[];
  withdrawal_info: any[];
  order_info: Record<string, number>;
  balance_info: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

@Injectable()
export class OwnershipTransferService {
  private readonly transfers: OwnershipTransferRecord[] = [];
  private nextId = 1;

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTransfer(input: {
    shop_id: number | string;
    vendor_id: number | string;
    message?: string;
    created_by: number;
  }): Promise<Shop> {
    const shopId = Number(input.shop_id);
    const vendorId = Number(input.vendor_id);

    if (!Number.isFinite(shopId) || !Number.isFinite(vendorId)) {
      throw new BadRequestException('Invalid shop or vendor id');
    }

    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['owner'],
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const currentOwner = await this.userRepository.findOne({
      where: { id: vendorId },
      relations: ['profile'],
    });

    if (!currentOwner) {
      throw new NotFoundException('Vendor not found');
    }

    const previousOwner = await this.userRepository.findOne({
      where: { id: shop.owner.id },
      relations: ['profile'],
    });

    if (!previousOwner) {
      throw new NotFoundException('Current shop owner not found');
    }

    const activeTransfer = this.transfers.find(
      (transfer) =>
        transfer.shop.id === shop.id &&
        transfer.deleted_at === null &&
        ['pending', 'processing'].includes(transfer.status),
    );

    if (activeTransfer) {
      throw new ConflictException('An ownership transfer request already exists for this shop');
    }

    const now = new Date().toISOString();
    const transfer: OwnershipTransferRecord = {
      id: this.nextId++,
      transaction_identifier: `OT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      previous_owner: previousOwner,
      current_owner: currentOwner,
      message: input.message,
      status: 'pending',
      shop,
      refund_info: [],
      withdrawal_info: [],
      order_info: {
        pending: 0,
        processing: 0,
        complete: 0,
        localFacility: 0,
        outForDelivery: 0,
        failed: 0,
        cancelled: 0,
        refunded: 0,
      },
      balance_info: {
        admin_commission_rate: 0,
        total_earnings: 0,
        withdrawn_amount: 0,
        current_balance: Number(shop.balance ?? 0),
        payment_info:
          shop.settings?.payment_info ??
          shop.settings?.balance_info?.payment_info ??
          null,
      },
      created_by: String(input.created_by),
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.transfers.unshift(transfer);

    return shop;
  }

  listTransfers(query: Record<string, any>) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.max(Number(query.limit ?? 10), 1);
    const sortedBy = String(query.sortedBy ?? SortOrder.DESC).toLowerCase() === SortOrder.ASC
      ? SortOrder.ASC
      : SortOrder.DESC;
    const orderBy = String(query.orderBy ?? 'created_at');

    let filtered = this.transfers.filter((transfer) => transfer.deleted_at === null);

    if (query.shop_id) {
      filtered = filtered.filter(
        (transfer) => String(transfer.shop.id) === String(query.shop_id),
      );
    }

    const searchTerm = this.extractTransactionIdentifier(query.search) ?? query.transaction_identifier;
    if (searchTerm) {
      const normalizedSearch = String(searchTerm).toLowerCase();
      filtered = filtered.filter((transfer) =>
        transfer.transaction_identifier.toLowerCase().includes(normalizedSearch),
      );
    }

    filtered.sort((left, right) => {
      const direction = sortedBy === SortOrder.ASC ? 1 : -1;
      const leftValue = this.getSortableValue(left, orderBy);
      const rightValue = this.getSortableValue(right, orderBy);
      if (leftValue < rightValue) {
        return -1 * direction;
      }
      if (leftValue > rightValue) {
        return 1 * direction;
      }
      return 0;
    });

    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    const url = `/ownership-transfer?limit=${limit}`;

    return {
      data,
      ...paginate(filtered.length, page, limit, data.length, url),
    };
  }

  getTransfer(transactionIdentifier: string) {
    const transfer = this.transfers.find(
      (item) =>
        item.deleted_at === null &&
        item.transaction_identifier === transactionIdentifier,
    );

    if (!transfer) {
      throw new NotFoundException('Ownership transfer request not found');
    }

    return transfer;
  }

  async updateTransfer(id: number, input: { status?: OwnershipTransferStatus }) {
    const transfer = this.transfers.find(
      (item) => item.id === id && item.deleted_at === null,
    );

    if (!transfer) {
      throw new NotFoundException('Ownership transfer request not found');
    }

    if (input.status) {
      transfer.status = input.status;
    }

    transfer.updated_at = new Date().toISOString();

    if (transfer.status === 'approved') {
      const shop = await this.shopRepository.findOne({
        where: { id: transfer.shop.id },
        relations: ['owner'],
      });

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      const nextOwner = await this.userRepository.findOne({
        where: { id: Number(transfer.current_owner.id) },
      });

      if (!nextOwner) {
        throw new NotFoundException('Target owner not found');
      }

      shop.owner = nextOwner;
      await this.shopRepository.save(shop);
      transfer.shop = { ...transfer.shop, owner: nextOwner };
      transfer.previous_owner = transfer.previous_owner;
    }

    return transfer;
  }

  removeTransfer(id: number) {
    const transfer = this.transfers.find(
      (item) => item.id === id && item.deleted_at === null,
    );

    if (!transfer) {
      throw new NotFoundException('Ownership transfer request not found');
    }

    transfer.deleted_at = new Date().toISOString();
    transfer.updated_at = transfer.deleted_at;

    return true;
  }

  private extractTransactionIdentifier(search?: string) {
    if (!search) {
      return undefined;
    }

    const parts = String(search).split(';');
    const identifierPart = parts.find((part) =>
      part.startsWith('transaction_identifier:'),
    );

    return identifierPart?.split(':').slice(1).join(':');
  }

  private getSortableValue(
    transfer: OwnershipTransferRecord,
    orderBy: string,
  ): string | number {
    switch (orderBy) {
      case 'id':
        return transfer.id;
      case 'transaction_identifier':
        return transfer.transaction_identifier;
      case 'status':
        return transfer.status;
      case 'created_at':
      default:
        return transfer.created_at;
    }
  }
}