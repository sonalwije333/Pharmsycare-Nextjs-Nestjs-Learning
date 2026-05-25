// ownership-transfer/ownership-transfer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import ownershipTransferJSON from '@db/ownership-transfer.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateOwnershipTransferDto } from './dto/create-ownership-transfer.dto';
import { OwnershipTransfer } from './entities/ownership-transfer.entity';
import { GetOwnershipTransferDto, OwnershipTransferPaginator } from './dto/get-ownership-transfer.dto';
import { UpdateOwnershipTransferDto } from './dto/update-ownership-transfer.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

const ownershipTransfer = plainToClass(OwnershipTransfer, ownershipTransferJSON);

const options = {
  keys: ['transaction_identifier', 'status', 'previous_owner.name', 'current_owner.name'],
  threshold: 0.3,
};
const fuse = new Fuse(ownershipTransfer, options);

@Injectable()
export class OwnershipTransferService {
  private ownershipTransfer: OwnershipTransfer[] = ownershipTransfer;

  create(createOwnershipTransferDto: CreateOwnershipTransferDto): OwnershipTransfer {
    const newTransfer: OwnershipTransfer = {
      id: this.ownershipTransfer.length + 1,
      transaction_identifier: createOwnershipTransferDto.transaction_identifier || `TR-${Date.now()}`,
      previous_owner: createOwnershipTransferDto.previous_owner_id ? { id: createOwnershipTransferDto.previous_owner_id } as any : null,
      current_owner: createOwnershipTransferDto.current_owner_id ? { id: createOwnershipTransferDto.current_owner_id } as any : null,
      message: createOwnershipTransferDto.message,
      created_by: createOwnershipTransferDto.created_by?.toString() || '1',
      status: createOwnershipTransferDto.status || 'pending',
      order_info: null,
      name: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as OwnershipTransfer;

    this.ownershipTransfer.push(newTransfer);
    return newTransfer;
  }

  findAll({ search, limit, page, status, previous_owner_id, current_owner_id, orderBy, sortedBy }: GetOwnershipTransferDto): OwnershipTransferPaginator {
    if (!page) page = 1;
    if (!limit) limit = 10;
    
    let data: OwnershipTransfer[] = [...this.ownershipTransfer];

    // Filter by status
    if (status) {
      data = data.filter(item => item.status === status);
    }

    // Filter by previous owner ID
    if (previous_owner_id) {
      data = data.filter(item => item.previous_owner?.id === previous_owner_id);
    }

    // Filter by current owner ID
    if (current_owner_id) {
      data = data.filter(item => item.current_owner?.id === current_owner_id);
    }

    // Search functionality
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'status' && value) {
          data = data.filter(item => item.status === value);
        } else if (key === 'transaction_identifier' && value) {
          data = data.filter(item => item.transaction_identifier?.includes(value));
        } else {
          data = fuse.search(search)?.map(({ item }) => item);
        }
      }
    }

    // Sort data
    const sortColumn = this.mapOrderByToColumn(orderBy);
    const sortOrder = sortedBy || 'asc';
    data.sort((a, b) => {
      const aValue = a[sortColumn as keyof OwnershipTransfer];
      const bValue = b[sortColumn as keyof OwnershipTransfer];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/ownership-transfer?search=${search}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getOwnershipTransfer(param: string, language: string): OwnershipTransfer {
    const transfer = this.ownershipTransfer.find(
      (p) => p.id === Number(param) || p.transaction_identifier === param
    );
    
    if (!transfer) {
      throw new NotFoundException(`Ownership transfer with ID/identifier "${param}" not found`);
    }
    
    return transfer;
  }

  update(id: number, updateOwnershipTransferDto: UpdateOwnershipTransferDto): OwnershipTransfer {
    const index = this.ownershipTransfer.findIndex((p) => p.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Ownership transfer with ID ${id} not found`);
    }
    
    const baseTransfer = this.ownershipTransfer[index];
    const updated = {
      ...baseTransfer,
      ...updateOwnershipTransferDto,
      updated_at: new Date(),
    } as OwnershipTransfer;
    
    if (updated.created_by && typeof updated.created_by !== 'string') {
      updated.created_by = String(updated.created_by);
    }
    
    this.ownershipTransfer[index] = updated;
    
    return this.ownershipTransfer[index];
  }

  private mapOrderByToColumn(orderBy: string | undefined): string {
    const columnMap: Record<string, string> = {
      'CREATED_AT': 'created_at',
      'UPDATED_AT': 'updated_at',
      'TRANSACTION_IDENTIFIER': 'transaction_identifier',
    };
    return columnMap[orderBy] || 'created_at';
  }

  remove(id: number): CoreMutationOutput {
    const index = this.ownershipTransfer.findIndex((p) => p.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Ownership transfer with ID ${id} not found`);
    }
    
    this.ownershipTransfer.splice(index, 1);
    
    return {
      success: true,
      message: `Ownership transfer #${id} removed successfully`,
    };
  }
}