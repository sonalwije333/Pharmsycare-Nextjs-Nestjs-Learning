// wishlists/dto/wishlist-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Wishlist } from '../entities/wishlist.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class WishlistResponse {
  @ApiProperty({ type: Wishlist })
  wishlist: Wishlist;
}

export class ToggleWishlistResponse extends CoreMutationOutput {
  @ApiProperty({ description: 'Is product in wishlist', example: true })
  in_wishlist: boolean;
}

export class InWishlistResponse {
  @ApiProperty({ description: 'Is product in wishlist', example: true })
  in_wishlist: boolean;
}