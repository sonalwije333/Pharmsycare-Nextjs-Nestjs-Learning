import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty({ description: 'User ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    product_id: number;

    @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
    @IsOptional()
    @IsNumber()
    shop_id?: number;

    @ApiProperty({ description: 'Question', example: 'Is this product suitable for babies?' })
    @IsNotEmpty()
    @IsString()
    question: string;

    @ApiPropertyOptional({ description: 'Answer', example: 'Yes, it is suitable for babies above 6 months.' })
    @IsOptional()
    @IsString()
    answer?: string;
}