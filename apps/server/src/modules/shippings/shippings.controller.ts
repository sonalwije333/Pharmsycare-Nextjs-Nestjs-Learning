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
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Shipping } from './entities/shipping.entity';
import { PermissionType } from '../../common/enums/PermissionType.enum';
import {
  QueryShippingClassesOrderByColumn,
  ShippingType,
} from '../../common/enums/enums';
import { SortOrder } from '../common/dto/generic-conditions.dto';

@ApiTags('Shippings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shippings')
export class ShippingsController {
  constructor(private readonly shippingsService: ShippingsService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new shipping method',
    description:
      'Creates a new shipping method. Requires admin or store owner privileges.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Shipping method successfully created',
    type: Shipping,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Shipping name already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createShippingDto: CreateShippingDto,
  ): Promise<Shipping> {
    return this.shippingsService.create(createShippingDto);
  }

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Get all shipping methods',
    description:
      'Retrieves a list of shipping methods with filtering and pagination.',
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ShippingType,
    description: 'Filter by shipping type',
  })
  @ApiQuery({
    name: 'is_global',
    required: false,
    type: Boolean,
    description: 'Filter by global status',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: QueryShippingClassesOrderByColumn,
    description: 'Order by column',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipping methods retrieved successfully',
    type: ShippingPaginator,
  })
  async findAll(@Query() query: GetShippingsDto): Promise<ShippingPaginator> {
    return this.shippingsService.getShippings(query);
  }

  @Get('all')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get all shipping methods without pagination',
    description: 'Retrieves all shipping methods without pagination.',
  })
  @ApiQuery({
    name: 'is_global',
    required: false,
    type: Boolean,
    description: 'Filter by global status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All shipping methods retrieved successfully',
    type: [Shipping],
  })
  async getAll(@Query('is_global') is_global?: boolean): Promise<Shipping[]> {
    return this.shippingsService.getAll(is_global);
  }

  @Get('global')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Get global shipping methods',
    description: 'Retrieves all global shipping methods.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Global shipping methods retrieved successfully',
    type: [Shipping],
  })
  async getGlobal(): Promise<Shipping[]> {
    return this.shippingsService.getGlobalShippings();
  }

  @Get(':id')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
    PermissionType.CUSTOMER,
  )
  @ApiOperation({
    summary: 'Get shipping method by ID',
    description: 'Retrieves a specific shipping method by ID.',
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipping method retrieved successfully',
    type: Shipping,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Shipping method not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Shipping> {
    return this.shippingsService.findOne(id);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Update shipping method',
    description: 'Updates an existing shipping method.',
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipping method updated successfully',
    type: Shipping,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Shipping name already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Shipping method not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShippingDto: UpdateShippingDto,
  ): Promise<Shipping> {
    return this.shippingsService.update(id, updateShippingDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete shipping method',
    description:
      'Soft deletes a shipping method. Requires admin or store owner privileges.',
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Shipping method deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Shipping method not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shippingsService.remove(id);
  }

  @Post('restore/:id')
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Restore deleted shipping method',
    description:
      'Restores a soft-deleted shipping method. Requires super admin privileges.',
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipping method restored successfully',
    type: Shipping,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Shipping method not found',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<Shipping> {
    return this.shippingsService.restore(id);
  }
}
