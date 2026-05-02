// notify-logs/notify-logs.controller.ts
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
    type: NotifyLogsPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: GetNotifyLogsDto) {
    return this.notifyLogsService.findAllNotifyLogs(query);
  }

  @Get(':param')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get notify log by ID',
    description: 'Retrieve a single notification log by ID'
  })
  @ApiParam({
    name: 'param',
    description: 'Notify log ID',
    type: Number,
    example: 1
  })
  @ApiOkResponse({
    description: 'Notify log retrieved successfully',
    type: NotifyLogs
  })
  @ApiNotFoundResponse({ description: 'Notify log not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getNotifyLog(@Param('param') param: string, @Query('language') language: string) {
    return this.notifyLogsService.getNotifyLog(param, language);
  }

  @Put(':id')
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
    example: 1
  })
  @ApiOkResponse({
    description: 'Notify log marked as read',
    type: NotifyLogs
  })
  @ApiNotFoundResponse({ description: 'Notify log not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  readNotifyLogs(@Param('id', ParseIntPipe) id: number) {
    return this.notifyLogsService.readNotifyLog(id);
  }

  @Put('read-all/:id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notify logs as read',
    description: 'Mark all notifications as read for a user'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
    example: 1
  })
  @ApiOkResponse({
    description: 'All notify logs marked as read',
    type: CoreMutationOutput
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  notifyLogAllRead(@Param('id', ParseIntPipe) id: number) {
    return this.notifyLogsService.readAllNotifyLogs(id);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notify log',
    description: 'Delete a notification log by ID (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Notify log ID',
    type: Number,
    example: 1
  })
  @ApiOkResponse({
    description: 'Notify log deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Notify log not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  deleteNotifyLog(@Param('id', ParseIntPipe) id: number) {
    return this.notifyLogsService.remove(id);
  }
}