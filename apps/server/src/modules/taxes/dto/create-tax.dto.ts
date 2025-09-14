import { OmitType } from '@nestjs/swagger';
import { Tax } from '../entities/tax.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaxDto extends OmitType(Tax, [
    'id',
    'created_at',
    'updated_at',
]) {
    @ApiProperty({ description: 'Tax name', example: 'VAT' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Tax rate', example: 15.5 })
    @IsNumber()
    rate: number;

    @ApiProperty({ description: 'Is global tax', example: true })
    @IsBoolean()
    is_global: boolean;

    @ApiPropertyOptional({ description: 'Country code', example: 'US' })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({ description: 'State', example: 'California' })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ description: 'ZIP code', example: '90210' })
    @IsOptional()
    @IsString()
    zip?: string;

    @ApiPropertyOptional({ description: 'City', example: 'Los Angeles' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'Priority', example: 1 })
    @IsOptional()
    @IsNumber()
    priority?: number;

    @ApiProperty({ description: 'Apply to shipping', example: false })
    @IsBoolean()
    on_shipping: boolean;
}