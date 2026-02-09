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
    Request, ForbiddenException, // Add this import
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetMyReportDto, MyReportPaginator } from './dto/get-reports.dto';
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
import { MyReports } from './entities/report.entity';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new report', description: 'Creates a new report. Users can submit bug reports, feature requests, complaints, or suggestions.' })
    @ApiResponse({ status: 201, description: 'Report successfully created', type: MyReports })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createReport(@Body() createReportDto: CreateReportDto, @Request() req: any) {
        // Extract user ID from the authenticated request
        const userId = req.user?.id;
        return this.reportsService.create({ ...createReportDto, user_id: userId });
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all reports', description: 'Retrieves a list of reports with filtering and pagination. Requires admin permissions.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'type', required: false, enum: ['bug', 'feature', 'complaint', 'suggestion', 'other'], description: 'Type filter' })
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'resolved', 'closed'], description: 'Status filter' })
    @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'], description: 'Priority filter' })
    @ApiQuery({ name: 'user_id', required: false, type: String, description: 'User ID filter' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'NAME'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Reports retrieved successfully', type: MyReportPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetMyReportDto): Promise<MyReportPaginator> {
        return this.reportsService.findAllReports(query);
    }

    @Get('my-reports')
    @Roles(PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get my reports', description: 'Retrieves reports submitted by the authenticated user.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'type', required: false, enum: ['bug', 'feature', 'complaint', 'suggestion', 'other'], description: 'Type filter' })
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'resolved', 'closed'], description: 'Status filter' })
    @ApiResponse({ status: 200, description: 'Reports retrieved successfully', type: MyReportPaginator })
    async getMyReports(@Query() query: GetMyReportDto, @Request() req: any): Promise<MyReportPaginator> {
        // Extract user ID from the authenticated request
        const userId = req.user?.id;
        return this.reportsService.getMyReports(query, userId);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get report by ID', description: 'Retrieves a specific report by ID. Users can only access their own reports.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiResponse({ status: 200, description: 'Report retrieved successfully', type: MyReports })
    @ApiResponse({ status: 404, description: 'Report not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getReport(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<MyReports> {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // For customers, verify they own the report
        if (userRole === PermissionType.CUSTOMER) {
            const report = await this.reportsService.findOne(id);
            if (report.user_id !== userId) {
                throw new ForbiddenException('You can only access your own reports');
            }
        }

        return this.reportsService.findOne(id);
    }

    @Put(':id/status')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update report status', description: 'Updates the status of a report. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiQuery({ name: 'status', required: true, enum: ['pending', 'in_progress', 'resolved', 'closed'], description: 'New status' })
    @ApiResponse({ status: 200, description: 'Report status updated successfully', type: MyReports })
    @ApiResponse({ status: 400, description: 'Bad request - invalid status' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async updateReportStatus(
        @Param('id', ParseIntPipe) id: number,
        @Query('status') status: string
    ): Promise<MyReports> {
        return this.reportsService.updateStatus(id, status);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update report', description: 'Updates report details. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiResponse({ status: 200, description: 'Report updated successfully', type: MyReports })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReportDto: UpdateReportDto,
    ): Promise<MyReports> {
        return this.reportsService.update(id, updateReportDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete report', description: 'Soft deletes a report. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiResponse({ status: 204, description: 'Report deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async deleteReport(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.reportsService.remove(id);
    }
}