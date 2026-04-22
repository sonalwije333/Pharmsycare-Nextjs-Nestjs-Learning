// shops/shops.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
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
import { ShopsService } from './shops.service';
import { CreateShopDto, ApproveShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { Shop } from './entities/shop.entity';
import { UserPaginator } from 'src/users/dto/get-users.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Shops')
@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Create a new shop',
    description: 'Creates a new shop (Admin/Store owner only)'
  })
  @ApiCreatedResponse({
    description: 'Shop created successfully',
    type: Shop
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateShopDto })
  create(
    @Body() createShopDto: CreateShopDto,
    @Request() req: ExpressRequest & { user?: { id?: number } }
  ): Promise<Shop> {
    return this.shopsService.create(createShopDto, req.user?.id);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all shops',
    description: 'Retrieve paginated list of all shops with filtering options'
  })
  @ApiOkResponse({
    description: 'Shops retrieved successfully',
    type: ShopPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'searchJoin', required: false, enum: ['and', 'or'], description: 'How to join search conditions' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filter by active status' })
  async getShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getShops(query);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get shop by slug',
    description: 'Retrieve a specific shop by slug'
  })
  @ApiParam({ name: 'slug', description: 'Shop slug', example: 'furniture-shop' })
  @ApiOkResponse({
    description: 'Shop retrieved successfully',
    type: Shop
  })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  async getShop(@Param('slug') slug: string): Promise<Shop> {
    return this.shopsService.getShop(slug);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Update shop',
    description: 'Update an existing shop by ID'
  })
  @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
  @ApiOkResponse({
    description: 'Shop updated successfully',
    type: Shop
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateShopDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShopDto: UpdateShopDto
  ): Promise<Shop> {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  // @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Delete shop',
    description: 'Permanently delete a shop (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
  @ApiOkResponse({
    description: 'Shop deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.shopsService.remove(id);
  }
}

@ApiTags('Shop Staff')
@Controller('staffs')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class StaffsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Get shop staff',
    description: 'Retrieve paginated list of staff for a specific shop'
  })
  @ApiOkResponse({
    description: 'Staff retrieved successfully',
    type: UserPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'shop_id', required: true, type: Number, description: 'Shop ID' })
  async getStaffs(@Query() query: GetStaffsDto): Promise<UserPaginator> {
    return this.shopsService.getStaffs(query);
  }
}

@ApiTags('Shop Approval')
@Controller('approve-shop')
@UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is ready
@ApiBearerAuth('JWT-auth')
export class ApproveShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve shop',
    description: 'Approve a pending shop (Admin only)'
  })
  @ApiOkResponse({
    description: 'Shop approved successfully',
    type: Shop
  })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  @ApiBody({ schema: { type: 'object', properties: { id: { type: 'number', example: 1 } } } })
  async approveShop(@Body('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.approveShop(id);
  }
}

@ApiTags('Shop Disapproval')
@Controller('disapprove-shop')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class DisapproveShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disapprove shop',
    description: 'Disapprove/Deactivate a shop (Admin only)'
  })
  @ApiOkResponse({
    description: 'Shop disapproved successfully',
    type: Shop
  })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  @ApiBody({ schema: { type: 'object', properties: { id: { type: 'number', example: 1 } } } })
  async disapproveShop(@Body('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.disapproveShop(id);
  }
}

@ApiTags('Nearby Shops')
@Controller('near-by-shop')
@Public()
export class NearByShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get(':lat/:lng')
  @ApiOperation({
    summary: 'Get nearby shops',
    description: 'Retrieve shops near a specific location'
  })
  @ApiParam({ name: 'lat', description: 'Latitude', example: '40.7128' })
  @ApiParam({ name: 'lng', description: 'Longitude', example: '-74.0060' })
  @ApiOkResponse({
    description: 'Nearby shops retrieved successfully',
    type: [Shop]
  })
  async getNearByShop(
    @Param('lat') lat: string,
    @Param('lng') lng: string
  ): Promise<Shop[]> {
    return this.shopsService.getNearByShop(lat, lng);
  }
}

@ApiTags('New Shops')
@Controller('new-shops')
@Public()
export class NewShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get new shops',
    description: 'Retrieve paginated list of newly created shops'
  })
  @ApiOkResponse({
    description: 'New shops retrieved successfully',
    type: ShopPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getNewShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getNewShops(query);
  }
}