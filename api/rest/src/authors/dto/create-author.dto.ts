// authors/dto/create-author.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Author } from '../entities/author.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';

export class CreateAuthorDto {
  @ApiProperty({ description: 'Author name', example: 'Kaity lerry' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Author bio', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Birth date', required: false })
  @IsString()
  @IsOptional()
  born?: string;

  @ApiProperty({ description: 'Death date', required: false })
  @IsString()
  @IsOptional()
  death?: string;

  @ApiProperty({ description: 'Languages', required: false })
  @IsString()
  @IsOptional()
  languages?: string;

  @ApiProperty({ description: 'Quote', required: false })
  @IsString()
  @IsOptional()
  quote?: string;

  @ApiProperty({ description: 'Is approved', default: true })
  @IsBoolean()
  @IsOptional()
  is_approved?: boolean;

  @ApiProperty({ description: 'Shop ID', required: false })
  @IsString()
  @IsOptional()
  shop_id?: string;

  @ApiProperty({
    description: 'Author image',
    type: Attachment,
    required: false,
  })
  @ValidateNested()
  @Type(() => Attachment)
  @IsOptional()
  image?: Attachment;

  @ApiProperty({
    description: 'Cover image',
    type: Attachment,
    required: false,
  })
  @ValidateNested()
  @Type(() => Attachment)
  @IsOptional()
  cover_image?: Attachment;

  @ApiProperty({
    description: 'Social links',
    type: () => ShopSocials,
    isArray: true,
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopSocials)
  @IsOptional()
  socials?: ShopSocials[];

  @ApiProperty({ description: 'Language', default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}
