import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    Put,
    Delete,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Wishlist } from './entities/wishlist.entity';
import {CreateWishlistDto} from "./dto/create-wishlists.dto";
import {UpdateWishlistDto} from "./dto/update-wishlists.dto";
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Wishlists')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/wishlists')
export class WishlistsController {
    constructor(private wishlistService: WishlistsService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all wishlists', description: 'Retrieves a list of all wishlists with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'user_id', required: false, type: Number, description: 'User ID filter' })
    @ApiQuery({ name: 'product_id', required: false, type: Number, description: 'Product ID filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Wishlists retrieved successfully', type: WishlistPaginator })
    async findAll(@Query() query: GetWishlistDto): Promise<WishlistPaginator> {
        return this.wishlistService.findAllWishlists(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get wishlist by ID', description: 'Retrieves a specific wishlist by ID.' })
    @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
    @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully', type: Wishlist })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async find(@Param('id', ParseIntPipe) id: number): Promise<Wishlist> {
        return this.wishlistService.findWishlist(id);
    }

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Create a new wishlist', description: 'Adds a product to a user\'s wishlist.' })
    @ApiResponse({ status: 201, description: 'Wishlist created successfully', type: Wishlist })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Product or user not found' })
    async create(@Body() createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
        return this.wishlistService.create(createWishlistDto);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update wishlist', description: 'Updates an existing wishlist.' })
    @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
    @ApiResponse({ status: 200, description: 'Wishlist updated successfully', type: Wishlist })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWishlistDto: UpdateWishlistDto,
    ): Promise<Wishlist> {
        return this.wishlistService.update(id, updateWishlistDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Delete wishlist', description: 'Removes a product from a wishlist.' })
    @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
    @ApiResponse({ status: 200, description: 'Wishlist deleted successfully' })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.wishlistService.delete(id);
    }

    @Post('/toggle')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Toggle wishlist', description: 'Adds or removes a product from wishlist.' })
    @ApiResponse({ status: 200, description: 'Wishlist toggled successfully', type: Boolean })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Product or user not found' })
    async toggle(@Body() createWishlistDto: CreateWishlistDto): Promise<boolean> {
        return this.wishlistService.toggle(createWishlistDto);
    }

    @Get('/in_wishlist/:product_id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Check if product is in wishlist', description: 'Checks if a product is in the user\'s wishlist.' })
    @ApiParam({ name: 'product_id', description: 'Product ID', type: Number })
    @ApiQuery({ name: 'user_id', required: true, type: Number, description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Check completed successfully', type: Boolean })
    async inWishlist(
        @Param('product_id', ParseIntPipe) product_id: number,
        @Query('user_id', ParseIntPipe) user_id: number,
    ): Promise<boolean> {
        return this.wishlistService.isInWishlist(product_id, user_id);
    }
}