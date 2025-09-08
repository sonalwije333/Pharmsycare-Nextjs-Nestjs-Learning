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
import { NotifyLogsService } from './notify-logs.service';
import { GetNotifyLogsDto, NotifyLogsPaginator } from './dto/get-notify-logs.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
import { NotifyLogs } from './entities/notify-logs.entity';

@ApiTags('Notify Logs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/notify-logs')
export class NotifyLogsController {
    constructor(private readonly notifyLogsService: NotifyLogsService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all notification logs', description: 'Retrieves a list of notification logs with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'receiver', required: false, type: String, description: 'Receiver filter' })
    @ApiQuery({ name: 'notify_type', required: false, type: String, description: 'Notification type filter' })
    @ApiQuery({ name: 'is_read', required: false, type: Boolean, description: 'Read status filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Notification logs retrieved successfully', type: NotifyLogsPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetNotifyLogsDto): Promise<NotifyLogsPaginator> {
        return this.notifyLogsService.findAllNotifyLogs(query);
    }

    @Get(':param')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get notification by ID', description: 'Retrieves a specific notification by ID.' })
    @ApiParam({ name: 'param', description: 'Notification ID', type: String })
    @ApiResponse({ status: 200, description: 'Notification retrieved successfully', type: NotifyLogs })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getNotifyLog(
        @Param('param') param: string,
    ): Promise<NotifyLogs> {
        return this.notifyLogsService.getNotifyLog(param);
    }

    @Put('read')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Mark notifications as read', description: 'Mark specific notifications or all notifications for a receiver as read.' })
    @ApiResponse({ status: 200, description: 'Notifications marked as read successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - either ids or receiver must be provided' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async markAsRead(
        @Body() markAsReadDto: MarkAsReadDto,
    ) {
        return this.notifyLogsService.markAsRead(markAsReadDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete notification', description: 'Soft deletes a notification log.' })
    @ApiParam({ name: 'id', description: 'Notification ID', type: Number })
    @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async deleteNotifyLog(@Param('id', ParseIntPipe) id: number) {
        return this.notifyLogsService.remove(id);
    }
}