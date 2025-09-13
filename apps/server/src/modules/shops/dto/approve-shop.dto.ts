// src/modules/shops/dto/approve-shop.dto.ts
import { IsNumber, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ApproveShopDto {
    @ApiProperty({ description: 'Shop ID' })
    @Transform(({ value }) => value.toString())
    @IsString()
    id: string;

    @ApiProperty({ description: 'Admin commission rate', minimum: 0, maximum: 100 })
    @IsNumber()
    @Min(0)
    @Max(100)
    admin_commission_rate: number;
}