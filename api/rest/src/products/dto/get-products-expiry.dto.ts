import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GetProductsDto } from './get-products.dto';

export enum ProductExpiryAlertType {
  ALL = 'all',
  EXPIRED = 'expired',
  EXPIRING = 'expiring',
}

export class GetProductsExpiryDto extends GetProductsDto {
  @ApiPropertyOptional({ description: 'Days before expiry to include in expiring alerts', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  days_before?: number = 30;

  @ApiPropertyOptional({
    enum: ProductExpiryAlertType,
    description: 'Filter by expired, expiring soon, or all alerts',
    default: ProductExpiryAlertType.ALL,
  })
  @IsOptional()
  @IsEnum(ProductExpiryAlertType)
  alert_type?: ProductExpiryAlertType = ProductExpiryAlertType.ALL;
}

export class ProductExpiryStatsDto {
  expired: number;
  expiring_soon: number;
  total_alerts: number;
  days_before: number;
}
