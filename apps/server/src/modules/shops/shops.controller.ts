import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { UserPaginator } from '../users/dto/get-users.dto';
import { Shop } from './entites/shop.entity';
import { ShopPaginator } from './dto/shop-paginator.dto';
import { GetShopsDto } from './dto/get-shops.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreateStaffDto } from './dto/create-staff.dto';


@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new shop' })
  @ApiResponse({
    status: 201,
    description: 'Shop created successfully',
    type: Shop,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Shop slug already exists' })
  create(@Body() createShopDto: CreateShopDto): Promise<Shop> {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT', 'BALANCE'],
  })
  @ApiQuery({ name: 'sortedBy', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Shops retrieved successfully',
    type: ShopPaginator,
  })
  async getShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getShops(query);
  }

  @Get('new')
  @ApiOperation({ summary: 'Get new shops' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiResponse({
    status: 200,
    description: 'New shops retrieved successfully',
    type: [Shop],
  })
  async getNewShops(@Query('limit') limit = 10): Promise<Shop[]> {
    return this.shopsService.getNewShops(limit);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby shops' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, default: 10 })
  @ApiResponse({
    status: 200,
    description: 'Nearby shops retrieved successfully',
    type: [Shop],
  })
  async getNearbyShops(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 10,
  ): Promise<Shop[]> {
    return this.shopsService.getNearbyShops(lat, lng, radius);
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Shop retrieved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopById(@Param('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.getShopById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update shop' })
  @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Shop updated successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 409, description: 'Shop slug already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShopDto: UpdateShopDto,
  ): Promise<Shop> {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shop' })
  @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
  @ApiResponse({ status: 204, description: 'Shop deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shopsService.remove(id);
  }

  @Post('approve')
  @ApiOperation({ summary: 'Approve shop' })
  @ApiResponse({
    status: 200,
    description: 'Shop approved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async approveShop(@Body() approveShopDto: ApproveShopDto): Promise<Shop> {
    return this.shopsService.approveShop(approveShopDto);
  }

  @Post('disapprove/:id')
  @ApiOperation({ summary: 'Disapprove shop' })
  @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Shop disapproved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async disapproveShop(@Param('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.disapproveShop(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get shop by slug' })
  @ApiParam({ name: 'slug', description: 'Shop slug' })
  @ApiResponse({
    status: 200,
    description: 'Shop retrieved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopBySlug(@Param('slug') slug: string): Promise<Shop> {
    return this.shopsService.getShopBySlug(slug);
  }
}

@ApiTags('Shop Staff')
@Controller('staffs')
export class StaffsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'Staff member successfully created',
    type: UserPaginator,
  })
  create(@Body() createStaffDto: CreateStaffDto): Promise<any> {
    return this.shopsService.createStaff(createStaffDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiQuery({ name: 'shop_id', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Staff members retrieved successfully',
    type: UserPaginator,
  })
  async getStaffs(@Query() query: GetStaffsDto): Promise<UserPaginator> {
    return this.shopsService.getStaffs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  @ApiParam({ name: 'id', description: 'Staff ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Staff member retrieved successfully',
    type: UserPaginator,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async getStaff(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.shopsService.getStaffById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
    type: UserPaginator,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<any> {
    return this.shopsService.updateStaff(id, updateStaffDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Staff member deleted successfully',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shopsService.removeStaff(id);
  }
}

@ApiTags('Shop Approval')
@Controller('disapprove-shop')
export class DisapproveShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @ApiOperation({ summary: 'Disapprove shop' })
  @ApiResponse({
    status: 200,
    description: 'Shop disapproved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async disapproveShop(@Body('id') id: number): Promise<Shop> {
    return this.shopsService.disapproveShop(id);
  }
}

@ApiTags('Shop Approval')
@Controller('approve-shop')
export class ApproveShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @ApiOperation({ summary: 'Approve shop' })
  @ApiResponse({
    status: 200,
    description: 'Shop approved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async approveShop(@Body('id') id: number): Promise<Shop> {
    return this.shopsService.approveShop({
      id: id.toString(),
      admin_commission_rate: 0,
    });
  }
}

@ApiTags('Shops')
@Controller('near-by-shop')
export class NearByShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get(':lat/:lng')
  @ApiOperation({ summary: 'Get nearby shops' })
  @ApiParam({ name: 'lat', description: 'Latitude', type: Number })
  @ApiParam({ name: 'lng', description: 'Longitude', type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, default: 10 })
  @ApiResponse({
    status: 200,
    description: 'Nearby shops retrieved successfully',
    type: [Shop],
  })
  async getNearByShop(
    @Param('lat') lat: number,
    @Param('lng') lng: number,
    @Query('radius') radius = 10,
  ): Promise<Shop[]> {
    return this.shopsService.getNearbyShops(lat, lng, radius);
  }
}

@ApiTags('Shops')
@Controller('new-shops')
export class NewShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  @ApiOperation({ summary: 'Get new shops' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiResponse({
    status: 200,
    description: 'New shops retrieved successfully',
    type: [Shop],
  })
  async getNewShops(@Query('limit') limit = 10): Promise<Shop[]> {
    return this.shopsService.getNewShops(limit);
  }
}
