// tags/dto/create-tag.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Type } from 'src/types/entities/type.entity';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'Electronics',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tag type',
    type: () => Type,
    required: false
  })
  @IsOptional()
  type: Type;

  @ApiProperty({
    description: 'Tag type id',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  type_id?: number;

  @ApiProperty({
    description: 'Tag details',
    example: 'All electronics products',
    required: false
  })
  @IsString()
  @IsOptional()
  details: string;

  @ApiProperty({
    description: 'Tag image',
    type: () => Attachment,
    required: false
  })
  @IsOptional()
  image: Attachment;

  @ApiProperty({
    description: 'Tag icon',
    example: 'fa-tag',
    required: false
  })
  @IsString()
  @IsOptional()
  icon: string;

  @ApiProperty({
    description: 'Tag language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language: string;

  @ApiProperty({
    description: 'Tag slug',
    example: 'electronics',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;
}