// manufacturers/dto/create-manufacturer.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Manufacturer } from '../entities/manufacturer.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { ShopSocials } from 'src/settings/entities/setting.entity';
// import { Type as TypeEntity } from '../../types/entities/type.entity'; // Commented for future use

export class CreateManufacturerDto extends OmitType(Manufacturer, [
  'id',
  'cover_image',
  'description',
  'image',
  'name',
  'products_count',
  'slug',
  'socials',
  // 'type',
  'type_id',
  'website',
  'translated_languages',
]) {
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

  @ApiProperty({
    description: 'Manufacturer name',
    example: 'Too cool publication',
    required: true
  })
  @IsString()
  name: string;

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
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean;

  @ApiProperty({
    description: 'Type ID (for future use)',
    example: 8,
    required: false
  })
  @IsOptional()
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
    example: ['en'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[];
}