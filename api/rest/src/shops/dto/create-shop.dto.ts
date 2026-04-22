// shops/dto/create-shop.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Balance, Shop } from '../entities/shop.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { ShopSettings } from '../entities/shop.entity';

export class CreateShopDto extends PickType(Shop, [
  'name',
  'address',
  'description',
  'cover_image',
  'logo',
  'settings',
  'balance',
] as const) {
  @ApiProperty({
    description: 'Shop name',
    example: 'Furniture Shop',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Shop address',
    type: () => UserAddress,
    required: true
  })
  @IsObject()
  address: UserAddress;

  @ApiProperty({
    description: 'Shop description',
    example: 'The furniture shop is the best shop around the city.',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Shop cover image',
    type: () => Attachment,
    required: false
  })
  @IsOptional()
  @IsObject()
  cover_image: Attachment;

  @ApiProperty({
    description: 'Shop logo',
    type: () => Attachment,
    required: false
  })
  @IsOptional()
  @IsObject()
  logo?: Attachment;

  @ApiProperty({
    description: 'Shop settings',
    type: () => ShopSettings,
    required: false
  })
  @IsOptional()
  @IsObject()
  settings?: ShopSettings;

  @ApiProperty({
    description: 'Shop balance',
    type: () => Balance,
    required: false
  })
  @IsOptional()
  @IsObject()
  balance?: Balance;

  @ApiProperty({
    description: 'Category IDs',
    type: [Number],
    example: [1, 2, 3],
    required: false
  })
  @IsArray()
  @IsOptional()
  categories?: number[];
}

export class ApproveShopDto {
  @ApiProperty({
    description: 'Shop ID',
    example: 1
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Admin commission rate',
    example: 10,
    required: false
  })
  @IsNumber()
  @IsOptional()
  admin_commission_rate?: number;
}