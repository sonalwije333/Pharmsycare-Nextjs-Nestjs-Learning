// feedbacks/feedbacks.controller.ts
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
  ForbiddenException,
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
import { Permission } from '../common/enums/enums';

@ApiTags('📝 Feedbacks')
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

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
  @ApiQuery({ name: 'model_type', required: false })
  @ApiQuery({ name: 'model_id', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'positive', required: false })
  @ApiQuery({ name: 'negative', required: false })
  async findAll(@Query() query: GetFeedbacksDto): Promise<FeedbackPaginator> {
    return this.feedbackService.findAllFeedbacks(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get feedback by ID',
    description: 'Retrieve feedback details by ID (Public)',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: Number })
  @ApiOkResponse({
    description: 'Feedback retrieved successfully',
    type: Feedback,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  find(@Param('id', ParseIntPipe) id: number): Promise<Feedback> {
    return this.feedbackService.findFeedback(id);
  }

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
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateFeedBackDto })
  create(
    @Body() createFeedBackDto: CreateFeedBackDto,
    @CurrentUser() user: any,
  ): Promise<Feedback> {
    // Set user_id from current user if not provided
    if (!createFeedBackDto.user_id && user) {
      createFeedBackDto.user_id = user.id.toString();
    }
    return this.feedbackService.create(createFeedBackDto);
  }

  @Put(':id')
  @Roles(Permission.CUSTOMER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update feedback',
    description: 'Update feedback information by ID (Owner or Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: Number })
  @ApiOkResponse({
    description: 'Feedback updated successfully',
    type: Feedback,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to update this feedback',
  })
  @ApiBody({ type: UpdateFeedBackDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedBackDto: UpdateFeedBackDto,
    @CurrentUser() user: any,
  ): Promise<Feedback> {
    // Check if user has permission (admin or owner)
    const feedback = await this.feedbackService.findFeedback(id);
    if (
      user?.permissions?.includes(Permission.SUPER_ADMIN) ||
      feedback.user_id === user?.id?.toString()
    ) {
      return this.feedbackService.update(id, updateFeedBackDto);
    }
    throw new ForbiddenException(
      'You do not have permission to update this feedback',
    );
  }

  @Delete(':id')
  @Roles(Permission.CUSTOMER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete feedback',
    description: 'Permanently delete a feedback by ID (Owner or Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: Number })
  @ApiOkResponse({
    description: 'Feedback deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to delete this feedback',
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<CoreMutationOutput> {
    // Check if user has permission (admin or owner)
    const feedback = await this.feedbackService.findFeedback(id);
    if (
      user?.permissions?.includes(Permission.SUPER_ADMIN) ||
      feedback.user_id === user?.id?.toString()
    ) {
      return this.feedbackService.delete(id);
    }
    throw new ForbiddenException(
      'You do not have permission to delete this feedback',
    );
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
    example: 'product',
  })
  @ApiParam({ name: 'model_id', description: 'Model ID', example: '456' })
  @ApiOkResponse({
    description: 'Feedbacks retrieved successfully',
    type: [Feedback],
  })
  getByModel(
    @Param('model_type') model_type: string,
    @Param('model_id') model_id: string,
  ): Promise<Feedback[]> {
    return this.feedbackService.getFeedbacksByModel(model_type, model_id);
  }
}
