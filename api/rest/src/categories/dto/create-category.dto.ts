// categories/dto/create-category.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '../entities/category.entity';
import { Attachment } from '../../common/entities/attachment.entity';

export class CreateCategoryDto extends PickType(Category, [
  'name',
  'details',
  'icon',
  'language',
] as const) {
  @ApiProperty({ type: Attachment, required: false })
  @ValidateNested()
  @Type(() => Attachment)
  @IsOptional()
  image?: Attachment;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsNumber()
  @IsOptional()
  parent?: number;

  @ApiProperty({ description: 'Type ID', required: true })
  @IsNumber()
  type_id: number;
}
