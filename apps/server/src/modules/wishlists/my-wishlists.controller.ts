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
    Req,
} from '@nestjs/common';
import { MyWishlistService } from './my-wishlists.service';
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
import { Wishlist } from './entities/wishlist.entity';
import { Request } from 'express';
import {CreateWishlistDto} from "./dto/create-wishlists.dto";
import {UpdateWishlistDto} from "./dto/update-wishlists.dto";
import {User} from "../users/entities/user.entity";

// Define an authenticated request interface
interface AuthenticatedRequest extends Request {
    user: User; 
}

@ApiTags('My Wishlists')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/my-wishlists')
export class MyWishlistsController {
    constructor(private myWishlistService: MyWishlistService) {}

    @Get()
    @ApiOperation({ summary: 'Get my wishlists', description: 'Retrieves the authenticated user\'s wishlists.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Wishlists retrieved successfully', type: WishlistPaginator })
    async findAll(@Query() query: GetWishlistDto, @Req() req: AuthenticatedRequest): Promise<WishlistPaginator> {
        const userId = req.user.id; // Now TypeScript knows user exists and has id
        return this.myWishlistService.findMyWishlists(query, userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get my wishlist by ID', description: 'Retrieves a specific wishlist item for the authenticated user.' })
    @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
    @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully', type: Wishlist })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async find(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<Wishlist> {
        const userId = req.user.id;
        return this.myWishlistService.findMyWishlist(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Add to my wishlist', description: 'Adds a product to the authenticated user\'s wishlist.' })
    @ApiResponse({ status: 201, description: 'Product added to wishlist successfully', type: Wishlist })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async create(@Body() createWishlistDto: CreateWishlistDto, @Req() req: AuthenticatedRequest): Promise<Wishlist> {
        const userId = req.user.id;
        return this.myWishlistService.create(createWishlistDto, userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update my wishlist', description: 'Updates a wishlist item for the authenticated user.' })
    @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
    @ApiResponse({ status: 200, description: 'Wishlist updated successfully', type: Wishlist })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWishlistDto: UpdateWishlistDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<Wishlist> {
        const userId = req.user.id;
        return this.myWishlistService.update(id, updateWishlistDto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove from my wishlist', description: 'Removes a product from the authenticated user\'s wishlist.' })
    @ApiParam({ name: 'id', description: 'Wishlist ID', type: Number })
    @ApiResponse({ status: 200, description: 'Product removed from wishlist successfully' })
    @ApiResponse({ status: 404, description: 'Wishlist not found' })
    async delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<void> {
        const userId = req.user.id;
        return this.myWishlistService.delete(id, userId);
    }
}