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
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';

import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto } from './dto/get-shops.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { ShopPaginator } from './dto/shop-paginator.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';

@ApiTags('Shops')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) {}

    @Post()
    @Roles(PermissionType.STORE_OWNER, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new shop', description: 'Creates a new shop with the provided details.' })
    @ApiResponse({ status: 201, description: 'Shop created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    create(@Body() createShopDto: CreateShopDto, @Request() req) {
        return this.shopsService.create(createShopDto, req.user.id);
    }

    @Get()
    @Roles(PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.SUPER_ADMIN, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all shops', description: 'Retrieves a paginated list of shops with optional filtering.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
    @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filter by active status' })
    @ApiResponse({ status: 200, description: 'Shops retrieved successfully', type: ShopPaginator })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    findAll(@Query() query: GetShopsDto): Promise<ShopPaginator> {
        return this.shopsService.getShopsPaginated(query);
    }

    @Get(':slug')
    @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get shop by slug', description: 'Retrieves a specific shop by its slug.' })
    @ApiParam({ name: 'slug', description: 'Shop slug' })
    @ApiResponse({ status: 200, description: 'Shop retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Shop not found' })
    getShopBySlug(@Param('slug') slug: string) {
        return this.shopsService.getShopBySlug(slug);
    }

    @Put(':id')
    @Roles(PermissionType.STORE_OWNER, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update shop', description: 'Updates an existing shop.' })
    @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
    @ApiResponse({ status: 200, description: 'Shop updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Shop not found' })
    update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto, @Request() req) {
        return this.shopsService.update(parseInt(id), updateShopDto, req.user.id);
    }

    @Delete(':id')
    @Roles(PermissionType.STORE_OWNER, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete shop', description: 'Deletes a shop by ID.' })
    @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
    @ApiResponse({ status: 200, description: 'Shop deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Shop not found' })
    remove(@Param('id') id: string, @Request() req) {
        return this.shopsService.remove(parseInt(id), req.user.id);
    }
}

@ApiTags('Shop Staff')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shops/staffs')
export class StaffsController {
    constructor(private readonly shopsService: ShopsService) {}

    @Get()
    @Roles(PermissionType.STORE_OWNER, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get shop staff', description: 'Retrieves staff members for a specific shop.' })
    @ApiQuery({ name: 'shop_id', required: true, type: String, description: 'Shop ID' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    getStaffs(@Query() query: GetStaffsDto) {
        return this.shopsService.getShopStaff(query);
    }
}

@ApiTags('Shop Approval')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shops/approve')
export class ApproveShopController {
    constructor(private readonly shopsService: ShopsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Approve shop', description: 'Approves a shop and sets commission rate.' })
    @ApiResponse({ status: 200, description: 'Shop approved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Shop not found' })
    approve(@Body() approveShopDto: ApproveShopDto) {
        return this.shopsService.approveShop(approveShopDto);
    }
}

@ApiTags('Shop Approval')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shops/disapprove')
export class DisapproveShopController {
    constructor(private readonly shopsService: ShopsService) {}

    @Post(':id')
    @Roles(PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Disapprove shop', description: 'Disapproves a shop.' })
    @ApiParam({ name: 'id', description: 'Shop ID', type: Number })
    @ApiResponse({ status: 200, description: 'Shop disapproved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Shop not found' })
    disapprove(@Param('id') id: string) {
        return this.shopsService.disapproveShop(parseInt(id));
    }
}

@ApiTags('Shops')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shops/nearby')
export class NearByShopController {
    constructor(private readonly shopsService: ShopsService) {}

    @Get()
    @Roles(PermissionType.CUSTOMER, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get nearby shops', description: 'Retrieves shops near the specified location.' })
    @ApiQuery({ name: 'lat', required: true, type: Number, description: 'Latitude' })
    @ApiQuery({ name: 'lng', required: true, type: Number, description: 'Longitude' })
    @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in kilometers', default: 10 })
    @ApiResponse({ status: 200, description: 'Nearby shops retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - missing coordinates' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getNearby(@Query('lat') lat: number, @Query('lng') lng: number, @Query('radius') radius = 10) {
        return this.shopsService.getNearbyShops(lat, lng, radius);
    }
}

@ApiTags('Shops')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shops/new')
export class NewShopsController {
    constructor(private readonly shopsService: ShopsService) {}

    @Get()
    @Roles(PermissionType.CUSTOMER, PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get new shops', description: 'Retrieves recently created shops.' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of shops to return', default: 10 })
    @ApiResponse({ status: 200, description: 'New shops retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getNew(@Query('limit') limit = 10) {
        return this.shopsService.getNewShops(limit);
    }
}