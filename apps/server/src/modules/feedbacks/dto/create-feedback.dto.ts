import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateFeedBackDto {
    @ApiProperty({ description: 'Model ID', example: 'product-123' })
    @IsNotEmpty()
    @IsString()
    model_id: string;

    @ApiProperty({ description: 'Model type', example: 'Product' })
    @IsNotEmpty()
    @IsString()
    model_type: string;

    @ApiPropertyOptional({ description: 'Positive feedback', example: true })
    @IsOptional()
    @IsBoolean()
    positive?: boolean;

    @ApiPropertyOptional({ description: 'Negative feedback', example: false })
    @IsOptional()
    @IsBoolean()
    negative?: boolean;

    @ApiPropertyOptional({ description: 'User ID', example: 'user-123' })
    @IsOptional()
    @IsString()
    user_id?: string;
}