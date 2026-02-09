import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { GetAiTasksDto } from './dto/get-ai-tasks.dto';
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
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Generate AI content',
    description: 'Creates a new AI generation task for various content types.',
  })
  @ApiResponse({ status: 201, description: 'AI task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createAiDto: CreateAiDto, @Request() req) {
    return this.aiService.create(createAiDto, req.user?.id);
  }

  @Get('tasks')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get AI tasks',
    description:
      'Retrieves a list of AI tasks with filtering and pagination. Admins see all tasks, users see only their own.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['success', 'failed', 'processing'],
    description: 'Filter by task status',
  })
  @ApiQuery({
    name: 'task_type',
    required: false,
    enum: [
      'description_generation',
      'image_generation',
      'content_summary',
      'translation',
    ],
    description: 'Filter by task type',
  })
  @ApiResponse({ status: 200, description: 'AI tasks retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  getAiTasks(@Query() query: GetAiTasksDto, @Request() req) {
    // Admins can see all tasks, regular users only see their own
    const userId =
      req.user?.permissions?.includes(PermissionType.SUPER_ADMIN) ||
      req.user?.permissions?.includes(PermissionType.STORE_OWNER) ||
      req.user?.permissions?.includes(PermissionType.STAFF)
        ? undefined
        : req.user?.id;
    return this.aiService.findAll(query, userId);
  }

  @Get('tasks/:id')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Get AI task by ID',
    description: 'Retrieves a specific AI task by its ID.',
  })
  @ApiParam({ name: 'id', description: 'AI task ID' })
  @ApiResponse({ status: 200, description: 'AI task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'AI task not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  getAiTask(@Param('id') id: string, @Request() req) {
    const userId =
      req.user?.permissions?.includes(PermissionType.SUPER_ADMIN) ||
      req.user?.permissions?.includes(PermissionType.STORE_OWNER) ||
      req.user?.permissions?.includes(PermissionType.STAFF)
        ? undefined
        : req.user?.id;
    return this.aiService.findOne(+id, userId);
  }

  @Delete('tasks/:id')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Delete AI task',
    description: 'Permanently deletes an AI task.',
  })
  @ApiParam({ name: 'id', description: 'AI task ID' })
  @ApiResponse({ status: 200, description: 'AI task deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'AI task not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAiTask(@Param('id') id: string, @Request() req) {
    const userId = req.user?.permissions?.includes(PermissionType.SUPER_ADMIN)
      ? undefined
      : req.user?.id;
    return this.aiService.remove(+id, userId);
  }

  @Post('tasks/:id/retry')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Retry failed AI task',
    description: 'Retries a previously failed AI generation task.',
  })
  @ApiParam({ name: 'id', description: 'AI task ID' })
  @ApiResponse({
    status: 200,
    description: 'AI task retry initiated successfully',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - task cannot be retried or insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'AI task not found' })
  retryAiTask(@Param('id') id: string, @Request() req) {
    const userId = req.user?.permissions?.includes(PermissionType.SUPER_ADMIN)
      ? undefined
      : req.user?.id;
    return this.aiService.retryTask(+id, userId);
  }

  @Get('my-tasks')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Get my AI tasks',
    description: 'Retrieves AI tasks for the current authenticated user.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'User AI tasks retrieved successfully',
  })
  getMyAiTasks(@Query() query: GetAiTasksDto, @Request() req) {
    return this.aiService.findAll(query, req.user?.id);
  }
}
