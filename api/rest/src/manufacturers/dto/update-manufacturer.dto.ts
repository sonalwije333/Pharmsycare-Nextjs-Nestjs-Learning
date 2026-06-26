// manufacturers/dto/update-manufacturer.dto.ts
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateManufacturerDto } from './create-manufacturer.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { ShopSocials } from 'src/settings/entities/setting.entity';

export class UpdateManufacturerDto extends PartialType(CreateManufacturerDto) {
  @ApiProperty({
    description: 'Manufacturer name',
    example: 'Too cool publication',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Manufacturer slug',
    example: 'too-cool-publication',
    required: false
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Manufacturer description',
    example: 'To publish is to make content available to the general public...',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Manufacturer website',
    example: 'https://redq.io/',
    required: false
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'Cover image',
    type: () => Attachment,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Attachment)
  cover_image?: Attachment;

  @ApiProperty({
    description: 'Manufacturer image/logo',
    type: () => Attachment,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Attachment)
  image?: Attachment;

  @ApiProperty({
    description: 'Social media links',
    type: () => [ShopSocials],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopSocials)
  socials?: ShopSocials[];

  @ApiProperty({
    description: 'Is manufacturer approved',
    example: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'true' || value === '1') return true;
      if (normalized === 'false' || value === '0') return false;
    }
    if (typeof value === 'number') return value === 1;
    return value;
  })
  @IsBoolean()
  is_approved?: boolean;

  @ApiProperty({
    description: 'Number of products',
    example: 8,
    required: false
  })
  @IsOptional()
  @IsNumber()
  products_count?: number;

  @ApiProperty({
    description: 'Type ID (for future use)',
    example: 8,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  type_id?: number;

  // Commented for future use when Type module is created
  // @ApiProperty({
  //   description: 'Manufacturer type',
  //   type: () => TypeEntity,
  //   required: false
  // })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => TypeEntity)
  // type?: TypeEntity;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Translated languages',
    example: ['en', 'es', 'fr'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[];

  @ApiProperty({
    description: 'Shop ID',
    example: '1',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : String(value),
  )
  @IsString()
  shop_id?: string;
}