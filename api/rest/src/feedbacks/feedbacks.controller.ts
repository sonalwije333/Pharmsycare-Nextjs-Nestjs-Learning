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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { GetFeedbacksDto } from './dto/get-feedbacks.dto';
import { Feedback } from './entities/feedback.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { FeedbackService } from './feedbacks.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { FeedbackPaginator } from './dto/feedback-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission, SortOrder } from '../common/enums/enums';
import { ModelType } from 'src/common/enums/model-type.enum';


@ApiTags('📝 Feedbacks')
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @Roles(Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Create a new feedback',
    description: 'Creates a new feedback (Customer only)',
  })
  @ApiCreatedResponse({
    description: 'Feedback created successfully',
    type: Feedback,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or feedback cannot be both positive and negative' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateFeedBackDto })
  create(
    @Body() createFeedBackDto: CreateFeedBackDto,
    @CurrentUser() user: any,
  ): Promise<Feedback> {
    // Set user_id from current user if not provided
    if (!createFeedBackDto.user_id && user) {
      createFeedBackDto.user_id = user.id?.toString() || user._id?.toString();
    }
    return this.feedbackService.create(createFeedBackDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all feedbacks',
    description: 'Retrieve paginated list of all feedbacks (Public)',
  })
  @ApiOkResponse({
    description: 'Feedbacks retrieved successfully',
    type: FeedbackPaginator,
  })
  findAll(@Query() query: GetFeedbacksDto): Promise<FeedbackPaginator> {
    return this.feedbackService.findAllFeedbacks(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get feedback by ID',
    description: 'Retrieve feedback details by ID (Public)',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Feedback retrieved successfully',
    type: Feedback,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Feedback> {
    return this.feedbackService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.CUSTOMER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update feedback',
    description: 'Update feedback information by ID (Owner or Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Feedback updated successfully',
    type: Feedback,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or feedback cannot be both positive and negative' })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  @ApiForbiddenResponse({ description: 'Not authorized to update this feedback' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: UpdateFeedBackDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedBackDto: UpdateFeedBackDto,
    @CurrentUser() user: any,
  ): Promise<Feedback> {
    return this.feedbackService.update(id, updateFeedBackDto, user);
  }

  @Delete(':id')
  @Roles(Permission.CUSTOMER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete feedback',
    description: 'Soft delete a feedback by ID (Owner or Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Feedback deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  @ApiForbiddenResponse({ description: 'Not authorized to delete this feedback' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<CoreMutationOutput> {
    return this.feedbackService.remove(id, user);
  }

  @Get('model/:model_type/:model_id')
  @Public()
  @ApiOperation({
    summary: 'Get feedbacks by model',
    description: 'Retrieve all feedbacks for a specific model (Public)',
  })
  @ApiParam({
    name: 'model_type',
    description: 'Model type',
    example: ModelType.PRODUCT,
    enum: ModelType,
  })
  @ApiParam({ 
    name: 'model_id', 
    description: 'Model ID', 
    example: '456',
    type: String,
  })
  @ApiOkResponse({
    description: 'Feedbacks retrieved successfully',
    type: () => [Feedback],
  })
  getByModel(
    @Param('model_type') model_type: ModelType,
    @Param('model_id') model_id: string,
  ): Promise<Feedback[]> {
    return this.feedbackService.getFeedbacksByModel(model_type, model_id);
  }

  @Get('stats/:model_type/:model_id')
  @Public()
  @ApiOperation({
    summary: 'Get feedback statistics',
    description: 'Retrieve feedback statistics for a specific model (Public)',
  })
  @ApiParam({
    name: 'model_type',
    description: 'Model type',
    example: ModelType.PRODUCT,
    enum: ModelType,
  })
  @ApiParam({ 
    name: 'model_id', 
    description: 'Model ID', 
    example: '456',
    type: String,
  })
  @ApiOkResponse({
    description: 'Feedback statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        positive: { type: 'number', example: 75 },
        negative: { type: 'number', example: 25 },
        positive_percentage: { type: 'number', example: 75.0 },
        negative_percentage: { type: 'number', example: 25.0 },
      },
    },
  })
  getStats(
    @Param('model_type') model_type: ModelType,
    @Param('model_id') model_id: string,
  ): Promise<any> {
    return this.feedbackService.getFeedbackStats(model_type, model_id);
  }
}