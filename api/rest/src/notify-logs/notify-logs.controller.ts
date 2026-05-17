import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { NotifyLogsService } from './notify-logs.service';
import { GetNotifyLogsDto, NotifyLogsPaginator } from './dto/get-notify-logs.dto';
import { NotifyLogs } from './entities/notify-logs.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from "src/common/decorators/roles.decorator";
import { Permission } from '../common/enums/enums';


@ApiTags('🔔 Notify Logs')
@Controller('notify-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NotifyLogsController {
  constructor(private notifyLogsService: NotifyLogsService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get all notify logs',
    description: 'Retrieve paginated list of notification logs'
  })
  @ApiOkResponse({
    description: 'Notify logs retrieved successfully',
    type: () => NotifyLogsPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findAll(@Query() query: GetNotifyLogsDto): Promise<NotifyLogsPaginator> {
    return this.notifyLogsService.findAll(query);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get notify log by ID',
    description: 'Retrieve a single notification log by ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Notify log ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Notify log retrieved successfully',
    type: () => NotifyLogs
  })
  @ApiNotFoundResponse({ description: 'Notify log not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NotifyLogs> {
    return this.notifyLogsService.findOne(id);
  }

  @Put(':id/read')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notify log as read',
    description: 'Mark a single notification as read'
  })
  @ApiParam({
    name: 'id',
    description: 'Notify log ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Notify log marked as read',
    type: () => NotifyLogs
  })
  @ApiNotFoundResponse({ description: 'Notify log not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  markAsRead(@Param('id', ParseIntPipe) id: number): Promise<NotifyLogs> {
    return this.notifyLogsService.markAsRead(id);
  }

  @Put('read-all/:userId')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notify logs as read',
    description: 'Mark all notifications as read for a user'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'All notify logs marked as read',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'No notify logs found for user' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  markAllAsRead(@Param('userId', ParseIntPipe) userId: number): Promise<CoreMutationOutput> {
    return this.notifyLogsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notify log',
    description: 'Soft delete a notification log by ID (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Notify log ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Notify log deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Notify log not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.notifyLogsService.remove(id);
  }
}