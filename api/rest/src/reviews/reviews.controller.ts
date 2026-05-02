// reviews/reviews.controller.ts
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
  SetMetadata
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
  ApiCreatedResponse
} from '@nestjs/swagger';
import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';


const Public = () => SetMetadata('isPublic', true);

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all reviews',
    description: 'Retrieve paginated list of all reviews with filtering options'
  })
  @ApiOkResponse({
    description: 'Reviews retrieved successfully',
    type: ReviewPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in comment' })
  @ApiQuery({ name: 'product_id', required: false, type: Number, description: 'Filter by product ID' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by rating' })
  async findAll(@Query() query: GetReviewsDto): Promise<ReviewPaginator> {
    return this.reviewService.findAllReviews(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Retrieve a specific review by ID'
  })
  @ApiParam({ name: 'id', description: 'Review ID', type: Number })
  @ApiOkResponse({
    description: 'Review retrieved successfully',
    type: Review
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  find(@Param('id', ParseIntPipe) id: number): Promise<Review> {
    return this.reviewService.findReview(id);
  }

  @Post()
  @Roles(Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Create a new review',
    description: 'Creates a new product review (Customer only)'
  })
  @ApiCreatedResponse({
    description: 'Review created successfully',
    type: Review
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateReviewDto })
  create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return this.reviewService.create(createReviewDto);
  }

  @Put(':id')
  @Roles(Permission.CUSTOMER, Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Update review',
    description: 'Update an existing review by ID'
  })
  @ApiParam({ name: 'id', description: 'Review ID', type: Number })
  @ApiOkResponse({
    description: 'Review updated successfully',
    type: Review
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateReviewDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto
  ): Promise<Review> {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @Roles(Permission.CUSTOMER, Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete review',
    description: 'Permanently delete a review'
  })
  @ApiParam({ name: 'id', description: 'Review ID', type: Number })
  @ApiOkResponse({
    description: 'Review deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.reviewService.delete(id);
  }
}