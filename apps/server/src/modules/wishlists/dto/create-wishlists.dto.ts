import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWishlistDto {
    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    product_id: number;

    @ApiProperty({ description: 'User ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    user_id: number;
}