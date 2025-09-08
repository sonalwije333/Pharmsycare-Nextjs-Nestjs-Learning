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
import { ManufacturersService } from './manufacturers.service';

import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
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
import { Manufacturer } from './entities/manufacturer.entity';
import {GetManufacturersDto, GetTopManufacturersDto, ManufacturerPaginator} from "./dto/get-manufactures.dto";

@ApiTags('Manufacturers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/manufacturers')
export class ManufacturersController {
    constructor(private readonly manufacturersService: ManufacturersService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new manufacturer', description: 'Creates a new manufacturer. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'Manufacturer successfully created', type: Manufacturer })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createManufacturer(@Body() createManufacturerDto: CreateManufacturerDto) {
        return this.manufacturersService.create(createManufacturerDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all manufacturers', description: 'Retrieves a list of manufacturers with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'NAME'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Manufacturers retrieved successfully', type: ManufacturerPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetManufacturersDto): Promise<ManufacturerPaginator> {
        return this.manufacturersService.findAllManufacturers(query);
    }

    @Get('top')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get top manufacturers', description: 'Retrieves top manufacturers.' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items to return', example: 10 })
    @ApiResponse({ status: 200, description: 'Top manufacturers retrieved successfully', type: [Manufacturer] })
    async getTopManufacturers(@Query() query: GetTopManufacturersDto): Promise<Manufacturer[]> {
        return this.manufacturersService.getTopManufacturers(query);
    }

    @Get(':param')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get manufacturer by ID or slug', description: 'Retrieves a specific manufacturer by ID or slug.' })
    @ApiParam({ name: 'param', description: 'Manufacturer ID or slug', type: String })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiResponse({ status: 200, description: 'Manufacturer retrieved successfully', type: Manufacturer })
    @ApiResponse({ status: 404, description: 'Manufacturer not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getManufacturer(
        @Param('param') param: string,
        @Query('language') language: string
    ): Promise<Manufacturer> {
        return this.manufacturersService.getManufacturer(param, language);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update manufacturer', description: 'Updates an existing manufacturer.' })
    @ApiParam({ name: 'id', description: 'Manufacturer ID', type: Number })
    @ApiResponse({ status: 200, description: 'Manufacturer updated successfully', type: Manufacturer })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Manufacturer not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateManufacturerDto: UpdateManufacturerDto,
    ) {
        return this.manufacturersService.update(id, updateManufacturerDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete manufacturer', description: 'Soft deletes a manufacturer. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Manufacturer ID', type: Number })
    @ApiResponse({ status: 204, description: 'Manufacturer deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Manufacturer not found' })
    async deleteManufacturer(@Param('id', ParseIntPipe) id: number) {
        return this.manufacturersService.remove(id);
    }
}