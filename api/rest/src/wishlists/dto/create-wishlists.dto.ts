// wishlists/dto/create-wishlist.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Wishlist } from '../entities/wishlist.entity';

export class CreateWishlistDto extends PickType(Wishlist, ['product_id'] as const) {
  @ApiProperty({
    description: 'Product ID to add to wishlist',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;
}

export class ToggleWishlistDto {
  @ApiProperty({
    description: 'Product ID to toggle in wishlist',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;
}