// wishlists/wishlists.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import { Wishlist } from './entities/wishlist.entity';
import { ToggleWishlistResponse, InWishlistResponse } from './dto/wishlist-response.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateWishlistDto, ToggleWishlistDto } from './dto/create-wishlists.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Permission } from 'src/common/enums/enums';

@ApiTags('Wishlists')
@Controller('wishlists')
 @UseGuards(JwtAuthGuard, RolesGuard) 
 @ApiBearerAuth('JWT-auth')
export class WishlistsController {
  constructor(private readonly wishlistService: WishlistsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all wishlists',
    description: 'Retrieve paginated list of all wishlist items'
  })
  @ApiOkResponse({
    description: 'Wishlists retrieved successfully',
    type: WishlistPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'user_id', required: false, type: Number, description: 'Filter by user ID' })
  findAll(@Query() query: GetWishlistDto): Promise<WishlistPaginator> {
    return this.wishlistService.findAllWishlists(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get wishlist item by ID',
    description: 'Retrieve a specific wishlist item by ID'
  })
  @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
  @ApiOkResponse({
    description: 'Wishlist retrieved successfully',
    type: Wishlist
  })
  @ApiNotFoundResponse({ description: 'Wishlist item not found' })
  find(@Param('id', ParseIntPipe) id: number): Promise<Wishlist> {
    return this.wishlistService.findWishlist(id);
  }

  @Post()
   @Roles(Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Add to wishlist',
    description: 'Add a product to wishlist (Customer only)'
  })
  @ApiCreatedResponse({
    description: 'Product added to wishlist successfully',
    type: Wishlist
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateWishlistDto })
  create(@Body() createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    return this.wishlistService.create(createWishlistDto);
  }

  @Put(':id')
   @Roles(Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Update wishlist item',
    description: 'Update a wishlist item by ID'
  })
  @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
  @ApiOkResponse({
    description: 'Wishlist updated successfully',
    type: Wishlist
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Wishlist item not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateWishlistDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto
  ): Promise<Wishlist> {
    return this.wishlistService.update(id, updateWishlistDto);
  }

  @Delete(':id')
   @Roles(Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Remove from wishlist',
    description: 'Remove a product from wishlist by ID'
  })
  @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
  @ApiOkResponse({
    description: 'Product removed from wishlist successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Wishlist item not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.wishlistService.delete(id);
  }

  @Post('toggle')
  @Roles(Permission.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle wishlist',
    description: 'Toggle product in wishlist (add if not exists, remove if exists)'
  })
  @ApiOkResponse({
    description: 'Wishlist toggled successfully',
    type: ToggleWishlistResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: ToggleWishlistDto })
  toggle(@Body() toggleWishlistDto: ToggleWishlistDto): Promise<ToggleWishlistResponse> {
    return this.wishlistService.toggle(toggleWishlistDto);
  }

  @Get('in-wishlist/:product_id')
  @Public()
  @ApiOperation({
    summary: 'Check if product is in wishlist',
    description: 'Check if a specific product is in the user\'s wishlist'
  })
  @ApiParam({ name: 'product_id', description: 'Product ID', type: Number })
  @ApiOkResponse({
    description: 'Wishlist status retrieved successfully',
    type: InWishlistResponse
  })
  inWishlist(@Param('product_id', ParseIntPipe) productId: number): Promise<InWishlistResponse> {
    return this.wishlistService.isInWishlist(productId);
  }
}