// become-seller/dto/create-become-seller.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BecomeSeller,
  BecomeSellerOptions,
  CommissionItem,
  SellingStepItem,
  BusinessPurposeItem,
  FaqItems,
} from '../entities/become-seller.entity';
import { Attachment } from '../../common/entities/attachment.entity';

export class AttachmentDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  original?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  file_name?: string;
}

export class SellingStepItemDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ type: AttachmentDto, required: false })
  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  image?: AttachmentDto;
}

export class BusinessPurposeItemDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ type: Object })
  @IsObject()
  icon: {
    value: string;
  };
}

export class FaqItemsDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class BecomeSellerOptionsDto {
  @ApiProperty({ type: AttachmentDto })
  @ValidateNested()
  @Type(() => AttachmentDto)
  banner: AttachmentDto;

  @ApiProperty()
  @IsString()
  sellingStepsTitle: string;

  @ApiProperty()
  @IsString()
  sellingStepsDescription: string;

  @ApiProperty({ type: [SellingStepItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellingStepItemDto)
  sellingStepsItem: SellingStepItemDto[];

  @ApiProperty()
  @IsString()
  purposeTitle: string;

  @ApiProperty()
  @IsString()
  purposeDescription: string;

  @ApiProperty({ type: [BusinessPurposeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessPurposeItemDto)
  purposeItems: BusinessPurposeItemDto[];

  @ApiProperty()
  @IsString()
  commissionTitle: string;

  @ApiProperty()
  @IsString()
  commissionDescription: string;

  @ApiProperty()
  @IsString()
  faqTitle: string;

  @ApiProperty()
  @IsString()
  faqDescription: string;

  @ApiProperty({ type: [FaqItemsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemsDto)
  faqItems: FaqItemsDto[];
}

export class CommissionItemDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString()
  level: string;

  @ApiProperty()
  @IsString()
  sub_level: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  min_balance: number;

  @ApiProperty()
  @IsNumber()
  max_balance: number;

  @ApiProperty()
  @IsNumber()
  commission: number;

  @ApiProperty({ type: AttachmentDto })
  @ValidateNested()
  @Type(() => AttachmentDto)
  image: AttachmentDto;

  @ApiProperty({ default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class CreateBecomeSellerDto {
  @ApiProperty({ type: Object })
  @IsObject()
  page_options: BecomeSellerOptionsDto | { page_options: BecomeSellerOptionsDto };

  @ApiProperty({ type: [CommissionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommissionItemDto)
  commissions: CommissionItemDto[];

  @ApiProperty({ default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}
