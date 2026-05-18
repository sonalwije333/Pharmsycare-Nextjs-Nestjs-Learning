import { ApiProperty } from '@nestjs/swagger';

export enum OwnershipTransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum OwnershipTransferOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TRANSACTION_IDENTIFIER = 'TRANSACTION_IDENTIFIER',
  STATUS = 'STATUS',
}