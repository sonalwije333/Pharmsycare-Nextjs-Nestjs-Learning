import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { ShippingsService } from './shippings.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { GetShippingsDto, ShippingPaginator } from './dto/get-shippings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import {PermissionType, QueryShippingClassesOrderByColumn, ShippingType} from '../../common/enums/enums';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Shipping } from './entities/shipping.entity';

import { SortOrder } from '../common/dto/generic-conditions.dto';

@ApiTags('Shippings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/shippings')
export class ShippingsController {
    constructor(private readonly shippingsService: ShippingsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new shipping', description: 'Creates a new shipping method. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'Shipping successfully created', type: Shipping })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    create(@Body() createShippingDto: CreateShippingDto) {
        return this.shippingsService.create(createShippingDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all shippings', description: 'Retrieves a list of shipping methods with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'type', required: false, enum: ShippingType, description: 'Shipping type filter' })
    @ApiQuery({ name: 'is_global', required: false, type: Boolean, description: 'Is global filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: QueryShippingClassesOrderByColumn, description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder, description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Shippings retrieved successfully', type: ShippingPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetShippingsDto): Promise<ShippingPaginator> {
        return this.shippingsService.getShippings(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get shipping by ID', description: 'Retrieves a specific shipping method by ID.' })
    @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
    @ApiResponse({ status: 200, description: 'Shipping retrieved successfully', type: Shipping })
    @ApiResponse({ status: 404, description: 'Shipping not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Shipping> {
        return this.shippingsService.findOne(id);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update shipping', description: 'Updates an existing shipping method.' })
    @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
    @ApiResponse({ status: 200, description: 'Shipping updated successfully', type: Shipping })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Shipping not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateShippingDto: UpdateShippingDto,
    ) {
        return this.shippingsService.update(id, updateShippingDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete shipping', description: 'Soft deletes a shipping method. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
    @ApiResponse({ status: 204, description: 'Shipping deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Shipping not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.shippingsService.remove(id);
    }
}