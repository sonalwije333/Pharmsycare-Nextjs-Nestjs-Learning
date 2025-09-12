import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/enums';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';

import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {ReviewService} from "./reviews.service";
import {GetReviewsDto, ReviewPaginator} from "./dto/get-reviews.dto";
import {CreateReviewDto} from "./dto/create-review.dto";
import {UpdateReviewDto} from "./dto/update-review.dto";
import {Review} from "./entities/review.entity";

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all reviews', description: 'Retrieves a list of reviews with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'product_id', required: false, type: String, description: 'Product ID filter' })
    @ApiQuery({ name: 'shop_id', required: false, type: String, description: 'Shop ID filter' })
    @ApiQuery({ name: 'rating_min', required: false, type: Number, description: 'Minimum rating filter' })
    @ApiQuery({ name: 'rating_max', required: false, type: Number, description: 'Maximum rating filter' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'NAME'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully', type: ReviewPaginator })
    async findAll(@Query() query: GetReviewsDto): Promise<ReviewPaginator> {
        return this.reviewService.findAllReviews(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get review by ID', description: 'Retrieves a specific review by ID.' })
    @ApiParam({ name: 'id', description: 'Review ID', type: Number })
    @ApiResponse({ status: 200, description: 'Review retrieved successfully', type: Review })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async find(@Param('id', ParseIntPipe) id: number): Promise<Review> {
        return this.reviewService.findReview(id);
    }

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new review', description: 'Creates a new review for a product.' })
    @ApiResponse({ status: 201, description: 'Review successfully created', type: Review })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewService.create(createReviewDto);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update review', description: 'Updates an existing review. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Review ID', type: Number })
    @ApiResponse({ status: 200, description: 'Review updated successfully', type: Review })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReviewDto: UpdateReviewDto,
    ) {
        return this.reviewService.update(id, updateReviewDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete review', description: 'Soft deletes a review. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Review ID', type: Number })
    @ApiResponse({ status: 204, description: 'Review deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.delete(id);
    }
}