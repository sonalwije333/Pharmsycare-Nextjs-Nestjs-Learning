// taxes/dto/create-tax.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0' || normalized === '') return false;
  }
  if (typeof value === 'number') return value === 1;
  return false;
};

export class CreateTaxDto {
  @ApiProperty({
    description: 'Tax name',
    example: 'VAT',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tax rate (percentage)',
    example: 10,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({
    description: 'Is this a global tax',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_global?: boolean;

  @ApiProperty({
    description: 'Country for tax (if not global)',
    example: 'USA',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'State for tax (if not global)',
    example: 'California',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'ZIP code for tax (if not global)',
    example: '90210',
    required: false,
  })
  @IsString()
  @IsOptional()
  zip?: string;

  @ApiProperty({
    description: 'City for tax (if not global)',
    example: 'Los Angeles',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Priority (for multiple taxes)',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({
    description: 'Apply tax on shipping',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  on_shipping?: boolean;
}
