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
import { FlashSaleService } from './flash-sale.service';
import { GetFlashSaleDto, FlashSalePaginator } from './dto/get-flash-sales.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
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
import { FlashSale } from './entities/flash-sale.entity';
import { Product } from '../products/entities/product.entity';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Flash Sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/flash-sale')
export class FlashSaleController {
    constructor(private flashSaleService: FlashSaleService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new flash sale', description: 'Creates a new flash sale. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'Flash sale successfully created', type: FlashSale })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createFlashSale(@Body() createFlashSaleDto: CreateFlashSaleDto) {
        return this.flashSaleService.create(createFlashSaleDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all flash sales', description: 'Retrieves a list of active flash sales with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'sale_status', required: false, type: Boolean, description: 'Sale status filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'TITLE', 'DESCRIPTION', 'START_DATE', 'END_DATE'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Flash sales retrieved successfully', type: FlashSalePaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetFlashSaleDto): Promise<FlashSalePaginator> {
        return this.flashSaleService.findAllFlashSale(query);
    }

    @Get(':param')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get flash sale by ID or slug', description: 'Retrieves a specific flash sale by ID or slug.' })
    @ApiParam({ name: 'param', description: 'Flash sale ID or slug', type: String })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiResponse({ status: 200, description: 'Flash sale retrieved successfully', type: FlashSale })
    @ApiResponse({ status: 404, description: 'Flash sale not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getFlashSale(
        @Param('param') param: string,
        @Query('language') language: string,
    ): Promise<FlashSale> {
        return this.flashSaleService.getFlashSale(param, language);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update flash sale', description: 'Updates an existing flash sale.' })
    @ApiParam({ name: 'id', description: 'Flash sale ID', type: Number })
    @ApiResponse({ status: 200, description: 'Flash sale updated successfully', type: FlashSale })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Flash sale not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFlashSaleDto: UpdateFlashSaleDto,
    ) {
        return this.flashSaleService.update(id, updateFlashSaleDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete flash sale', description: 'Soft deletes a flash sale. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Flash sale ID', type: Number })
    @ApiResponse({ status: 204, description: 'Flash sale deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Flash sale not found' })
    async deleteFlashSale(@Param('id', ParseIntPipe) id: number) {
        return this.flashSaleService.remove(id);
    }
}

@ApiTags('Flash Sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/products-by-flash-sale')
export class ProductsByFlashSaleController {
    constructor(private flashSaleService: FlashSaleService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get products by flash sale', description: 'Retrieves products associated with active flash sales.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'TITLE', 'DESCRIPTION'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully', type: Object })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetFlashSaleDto): Promise<any> {
        return this.flashSaleService.findAllProductsByFlashSale(query);
    }
}