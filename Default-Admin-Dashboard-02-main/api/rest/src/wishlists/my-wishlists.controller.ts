// wishlists/my-wishlists.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MyWishlistService } from './my-wishlists.service';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import { Wishlist } from './entities/wishlist.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permission } from 'src/common/enums/enums';
import { RolesGuard } from 'src/auth/guards/roles.guard';


@ApiTags('My Wishlists')
@Controller('my-wishlists')
 @UseGuards(JwtAuthGuard, RolesGuard) 
 @ApiBearerAuth('JWT-auth')
export class MyWishlistsController {
  constructor(private readonly myWishlistService: MyWishlistService) {}

  @Get()
   @Roles(Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get my wishlist',
    description: 'Retrieve paginated list of current user\'s wishlist items'
  })
  @ApiOkResponse({
    description: 'Wishlist retrieved successfully',
    type: WishlistPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findAll(@Query() query: GetWishlistDto): Promise<WishlistPaginator> {
    return this.myWishlistService.findMyWishlists(query);
  }

  @Get(':id')
   @Roles(Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Get my wishlist item by ID',
    description: 'Retrieve a specific wishlist item from current user\'s wishlist'
  })
  @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
  @ApiOkResponse({
    description: 'Wishlist item retrieved successfully',
    type: Wishlist
  })
  @ApiNotFoundResponse({ description: 'Wishlist item not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  find(@Param('id', ParseIntPipe) id: number): Promise<Wishlist> {
    return this.myWishlistService.findMyWishlist(id);
  }
}