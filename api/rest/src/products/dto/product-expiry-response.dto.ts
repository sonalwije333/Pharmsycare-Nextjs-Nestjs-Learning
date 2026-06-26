import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export enum ProductExpiryStatus {
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
}

export class ProductExpiryAlertDto extends Product {
  @ApiProperty()
  expiry_date: string;

  @ApiProperty()
  days_until_expiry: number;

  @ApiProperty({ enum: ProductExpiryStatus })
  expiry_status: ProductExpiryStatus;
}
