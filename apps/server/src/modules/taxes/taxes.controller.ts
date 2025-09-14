import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { GetTaxesDto } from './dto/get-taxes.dto';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Tax } from './entities/tax.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';

@ApiTags('Taxes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/taxes')
export class TaxesController {
    constructor(private readonly taxesService: TaxesService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create tax rate', description: 'Add a new tax rate to the system' })
    @ApiResponse({ status: 201, description: 'Tax rate created', type: Tax })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    createTax(@Body() createTaxDto: CreateTaxDto) {
        return this.taxesService.create(createTaxDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'List tax rates', description: 'Get paginated list of tax rates with filters' })
    @ApiResponse({ status: 200, description: 'Tax rates retrieved', type: [Tax] })
    getTaxes(@Query() query: GetTaxesDto) {
        return this.taxesService.findAll(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get tax details', description: 'Retrieve specific tax rate information' })
    @ApiParam({ name: 'id', description: 'Tax ID' })
    @ApiResponse({ status: 200, description: 'Tax details', type: Tax })
    @ApiResponse({ status: 404, description: 'Tax not found' })
    getTax(@Param('id', ParseIntPipe) id: number) {
        return this.taxesService.findOne(id);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update tax rate', description: 'Modify existing tax rate details' })
    @ApiParam({ name: 'id', description: 'Tax ID' })
    @ApiResponse({ status: 200, description: 'Tax rate updated', type: Tax })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Tax not found' })
    updateTax(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaxDto: UpdateTaxDto,
    ) {
        return this.taxesService.update(id, updateTaxDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({ summary: 'Delete tax rate', description: 'Permanently remove a tax rate' })
    @ApiParam({ name: 'id', description: 'Tax ID' })
    @ApiResponse({ status: 204, description: 'Tax rate deleted' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Tax not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTax(@Param('id', ParseIntPipe) id: number) {
        return this.taxesService.remove(id);
    }
}