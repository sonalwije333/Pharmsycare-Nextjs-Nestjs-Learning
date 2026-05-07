import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class AuthorAttachmentDto {
  @ApiProperty({ required: true, example: 0, type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ required: true, example: '2026-05-07T03:49:11.313Z', type: String })
  @Type(() => Date)
  @IsDate()
  created_at: Date;

  @ApiProperty({ required: true, example: '2026-05-07T03:49:11.313Z', type: String })
  @Type(() => Date)
  @IsDate()
  updated_at: Date;

  @ApiProperty({ required: false, example: 'string', type: String })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ required: false, example: 'string', type: String })
  @IsOptional()
  @IsString()
  original?: string;
}

class AuthorSocialDto {
  @ApiProperty({ required: true, example: 'string', type: String })
  @IsString()
  icon: string;

  @ApiProperty({ required: true, example: 'string', type: String })
  @IsString()
  url: string;
}

export class CreateAuthorDto {
  @ApiProperty({ description: 'Author name', example: 'Kaity lerry', type: String })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Author bio', required: false, type: String, example: 'An author is the creator...' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Birth date', required: false, type: String, example: '1965-06-21T18:00:00.000Z' })
  @IsString()
  @IsOptional()
  born?: string;

  @ApiProperty({ description: 'Death date', required: false, type: String, example: null })
  @IsString()
  @IsOptional()
  death?: string;

  @ApiProperty({ description: 'Languages', required: false, type: String, example: 'English' })
  @IsString()
  @IsOptional()
  languages?: string;

  @ApiProperty({ description: 'Quote', required: false, type: String, example: 'All writers are vain...' })
  @IsString()
  @IsOptional()
  quote?: string;

  @ApiProperty({ description: 'Is approved', default: true, type: Boolean, example: true })
  @IsBoolean()
  @IsOptional()
  is_approved?: boolean;

  @ApiProperty({ description: 'Shop ID', required: false, type: String, example: '1' })
  @IsString()
  @IsOptional()
  shop_id?: string;

  @ApiProperty({
    description: 'Author image',
    type: AuthorAttachmentDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => AuthorAttachmentDto)
  @IsOptional()
  image?: AuthorAttachmentDto;

  @ApiProperty({
    description: 'Cover image',
    type: AuthorAttachmentDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => AuthorAttachmentDto)
  @IsOptional()
  cover_image?: AuthorAttachmentDto;

  @ApiProperty({
    description: 'Social links',
    type: () => AuthorSocialDto,
    isArray: true,
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorSocialDto)
  @IsOptional()
  socials?: AuthorSocialDto[];

  @ApiProperty({ description: 'Language', default: 'en', type: String, example: 'en' })
  @IsString()
  @IsOptional()
  language?: string = 'en';
}