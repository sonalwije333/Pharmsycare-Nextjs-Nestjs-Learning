// src/modules/store-notices/dto/create-store-notice.dto.ts
import { PickType } from '@nestjs/swagger';
import { StoreNotice } from '../entities/store-notices.entity';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreNoticeDto extends PickType(StoreNotice, [
    'notice',
    'description',
    'expired_at',
    'effective_from',
    'priority',
    'type',
    'received_by',
    'translated_languages',
] as const) {
    @ApiProperty({ type: [Number], required: false, description: 'Shop IDs for specific targeting' })
    @IsArray()
    @IsOptional()
    shop_ids?: number[];

    @ApiProperty({ type: [Number], required: false, description: 'User IDs for specific targeting' })
    @IsArray()
    @IsOptional()
    user_ids?: number[];
}