// src/config/database/seeders/ownership-transfer-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnershipTransfer } from '../../../ownership-transfer/entities/ownership-transfer.entity';
import ownershipTransferJson from '@db/ownership-transfer.json';
import { OwnershipTransferStatus } from 'src/common/enums/ownership-transfer.enum';

type OwnershipTransferSeedUser = {
  id: number;
  name: string;
  email: string;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
};

type OwnershipTransferSeedItem = {
  id: number;
  transaction_identifier: string;
  previous_owner?: OwnershipTransferSeedUser | null;
  current_owner?: OwnershipTransferSeedUser | null;
  message?: string | null;
  created_by: number | string;
  status: OwnershipTransferStatus;
  order_info?: OwnershipTransfer['order_info'] | null;
  created_at?: string;
  updated_at?: string;
};

@Injectable()
export class OwnershipTransferSeederService {
  private readonly logger = new Logger(OwnershipTransferSeederService.name);
  private readonly ownershipTransfers = ownershipTransferJson as OwnershipTransferSeedItem[];

  constructor(
    @InjectRepository(OwnershipTransfer)
    private ownershipTransferRepository: Repository<OwnershipTransfer>,
  ) {}

  async seed() {
    try {
      this.logger.log('🔄 Starting ownership transfer seeding...');
      
      // Check if ownership transfers already exist
      const count = await this.ownershipTransferRepository.count();
      if (count > 0) {
        this.logger.log(`📊 Found ${count} existing ownership transfers, skipping seed`);
        return;
      }

      // Map JSON data to OwnershipTransfer entities
      const transfers = this.ownershipTransfers.map((item) => this.mapTransfer(item));

      // Save ownership transfers to database
      const savedTransfers = await this.ownershipTransferRepository.save(transfers);
      
      this.logger.log(`✅ Successfully seeded ${savedTransfers.length} ownership transfers`);
      
      // Log transfer details
      savedTransfers.forEach(transfer => {
        this.logger.debug(`   - Transfer #${transfer.id}: ${transfer.transaction_identifier} - ${transfer.status} (previous_owner_id=${transfer.previous_owner_id}, current_owner_id=${transfer.current_owner_id})`);
      });
      
      return savedTransfers;
    } catch (error) {
      this.logger.error(`❌ Failed to seed ownership transfers: ${error.message}`);
      throw error;
    }
  }

  async clear() {
    try {
      this.logger.log('🗑️ Clearing ownership transfers...');
      
      const result = await this.ownershipTransferRepository.delete({});
      
      this.logger.log(`✅ Cleared ${result.affected || 0} ownership transfers`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to clear ownership transfers: ${error.message}`);
      throw error;
    }
  }

  async seedByStatus(status: string) {
    const filteredTransfers = this.ownershipTransfers.filter(
      item => item.status === status
    );

    const transfers = filteredTransfers.map((item) => this.mapTransfer(item));

    const saved = await this.ownershipTransferRepository.save(transfers);
    this.logger.log(`✅ Seeded ${saved.length} ownership transfers with status ${status}`);
    return saved;
  }

  async seedByPreviousOwner(ownerId: number) {
    const filteredTransfers = this.ownershipTransfers.filter(
      item => item.previous_owner?.id === ownerId
    );

    const transfers = filteredTransfers.map((item) => this.mapTransfer(item));

    const saved = await this.ownershipTransferRepository.save(transfers);
    this.logger.log(`✅ Seeded ${saved.length} ownership transfers for previous owner ${ownerId}`);
    return saved;
  }

  async seedByCurrentOwner(ownerId: number) {
    const filteredTransfers = this.ownershipTransfers.filter(
      item => item.current_owner?.id === ownerId
    );

    const transfers = filteredTransfers.map((item) => this.mapTransfer(item));

    const saved = await this.ownershipTransferRepository.save(transfers);
    this.logger.log(`✅ Seeded ${saved.length} ownership transfers for current owner ${ownerId}`);
    return saved;
  }

  private mapTransfer(item: OwnershipTransferSeedItem): OwnershipTransfer {
    const transfer = new OwnershipTransfer();

    transfer.id = item.id;
    transfer.transaction_identifier = item.transaction_identifier;
    transfer.previous_owner_id = item.previous_owner?.id ?? null;
    transfer.current_owner_id = item.current_owner?.id ?? null;
    transfer.message = item.message ?? null;
    transfer.created_by = String(item.created_by);
    transfer.status = item.status;
    transfer.order_info = item.order_info ?? {
      pending: 0,
      processing: 0,
      complete: 0,
      cancelled: 0,
      refunded: 0,
      failed: 0,
      localFacility: 0,
      outForDelivery: 0,
    };
    transfer.created_at = this.parseDate(item.created_at);
    transfer.updated_at = this.parseDate(item.updated_at);

    return transfer;
  }

  private parseDate(value?: string): Date {
    if (!value) {
      return new Date();
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}