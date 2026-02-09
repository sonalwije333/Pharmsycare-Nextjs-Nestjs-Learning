import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
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
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/PermissionType.enum';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AbusiveReportService} from "./reports.service";
import {CreateReportDto} from "./dto/create-report.dto";
import {UpdateReportDto} from "./dto/update-report.dto";
import { Report } from './entities/reports.entity';

@ApiTags('Abusive Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('abusive_reports')
export class AbusiveReportsController {
    constructor(private readonly reportService: AbusiveReportService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all abusive reports', description: 'Retrieves all abusive reports. Requires admin permissions.' })
    @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll() {
        return this.reportService.findAllReports();
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get report by ID', description: 'Retrieves a specific report by ID. Requires admin permissions.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiResponse({ status: 200, description: 'Report retrieved successfully', type: Report })
    @ApiResponse({ status: 404, description: 'Report not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async find(@Param('id', ParseIntPipe) id: number) {
        return this.reportService.findReport(id);
    }

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new report', description: 'Creates a new abusive report.' })
    @ApiResponse({ status: 201, description: 'Report successfully created', type: Report })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    create(@Body() createReportDto: CreateReportDto) {
        return this.reportService.create(createReportDto);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update report', description: 'Updates an existing report. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiResponse({ status: 200, description: 'Report updated successfully', type: Report })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReportDto: UpdateReportDto,
    ) {
        return this.reportService.update(id, updateReportDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete report', description: 'Soft deletes a report. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Report ID', type: Number })
    @ApiResponse({ status: 204, description: 'Report deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.reportService.delete(id);
    }
}