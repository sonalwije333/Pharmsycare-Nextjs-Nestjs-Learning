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
import { FeedbackService } from './feedbacks.service';
import { GetFeedbacksDto, FeedbackPaginator } from './dto/get-feedbacks.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
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
import { Feedback } from './entities/feedback.entity';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Feedbacks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/feedbacks')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new feedback', description: 'Creates a new feedback entry.' })
    @ApiResponse({ status: 201, description: 'Feedback successfully created', type: Feedback })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    create(@Body() createFeedBackDto: CreateFeedBackDto) {
        return this.feedbackService.create(createFeedBackDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all feedbacks', description: 'Retrieves a list of feedbacks with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'model_type', required: false, type: String, description: 'Model type filter' })
    @ApiQuery({ name: 'model_id', required: false, type: String, description: 'Model ID filter' })
    @ApiQuery({ name: 'user_id', required: false, type: String, description: 'User ID filter' })
    @ApiQuery({ name: 'positive', required: false, type: Boolean, description: 'Positive feedback filter' })
    @ApiQuery({ name: 'negative', required: false, type: Boolean, description: 'Negative feedback filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'MODEL_TYPE'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Feedbacks retrieved successfully', type: FeedbackPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetFeedbacksDto): Promise<FeedbackPaginator> {
        return this.feedbackService.findAllFeedBacks(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get feedback by ID', description: 'Retrieves a specific feedback by ID.' })
    @ApiParam({ name: 'id', description: 'Feedback ID', type: Number })
    @ApiResponse({ status: 200, description: 'Feedback retrieved successfully', type: Feedback })
    @ApiResponse({ status: 404, description: 'Feedback not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async find(@Param('id', ParseIntPipe) id: number): Promise<Feedback> {
        return this.feedbackService.findFeedBack(id);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update feedback', description: 'Updates an existing feedback.' })
    @ApiParam({ name: 'id', description: 'Feedback ID', type: Number })
    @ApiResponse({ status: 200, description: 'Feedback updated successfully', type: Feedback })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Feedback not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFeedBackDto: UpdateFeedBackDto,
    ) {
        return this.feedbackService.update(id, updateFeedBackDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete feedback', description: 'Permanently deletes a feedback. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Feedback ID', type: Number })
    @ApiResponse({ status: 204, description: 'Feedback deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Feedback not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.feedbackService.delete(id);
    }
}