import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { AssignProductSupplierDto } from './dto/assign-product-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';
import { GetUsersDto, UserPaginator } from '../users/dto/get-users.dto';

@ApiTags('🏭 Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({ summary: 'Create supplier user and profile' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'List supplier profiles' })
  findAll(@Query() query: GetUsersDto) {
    return this.suppliersService.findAll(query);
  }

  @Get('list')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({ summary: 'List supplier users (user control)' })
  getSupplierUsers(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.suppliersService.getSuppliers(query);
  }

  @Get('performance')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Supplier performance tracking metrics' })
  getPerformance() {
    return this.suppliersService.getPerformance();
  }

  @Get(':id/performance')
  @Roles(
    Permission.SUPER_ADMIN,
    Permission.STORE_OWNER,
    Permission.STAFF,
    Permission.SUPPLIER,
  )
  @ApiOperation({ summary: 'Performance metrics for a single supplier' })
  getSupplierPerformance(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.getSupplierPerformance(id);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF, Permission.SUPPLIER)
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Post(':id/assign-product')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({ summary: 'Assign product to supplier for auto reorder' })
  assignProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProductSupplierDto,
  ) {
    return this.suppliersService.assignProduct(id, dto);
  }
}
