import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';

@ApiTags('🏢 Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Create a branch' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'List branches with stock summary' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get('overview')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Network-wide branch statistics' })
  overview() {
    return this.branchesService.getOverview();
  }

  @Get('vendors')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'List vendors that can be assigned to a branch' })
  vendors(@Query('search') search?: string) {
    return this.branchesService.getVendors(search);
  }

  @Get('availability')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Cross-branch drug availability search' })
  availability(@Query('text') text?: string) {
    return this.branchesService.searchAvailability(text);
  }

  @Get('inventory')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Centralized inventory across all branches' })
  centralizedInventory(@Query() query: GetInventoryDto) {
    return this.branchesService.getCentralizedInventory(query);
  }

  @Get('coordination')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Low-stock alerts and transfer suggestions' })
  coordination() {
    return this.branchesService.getCoordination();
  }

  @Get('transfers')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Recent inter-branch transfers' })
  transfers() {
    return this.branchesService.getTransfers();
  }

  @Post('transfers')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Transfer stock between branches' })
  createTransfer(@Body() dto: CreateTransferDto) {
    return this.branchesService.createTransfer(dto);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Get a branch with its inventory' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Update a branch' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id/inventory/:productId')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Remove a product from a branch' })
  removeInventory(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.branchesService.removeInventory(id, productId);
  }

  @Post(':id/inventory')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Set product stock for a branch' })
  upsertInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertInventoryDto,
  ) {
    return this.branchesService.upsertInventory(id, dto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Delete a branch' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.remove(id);
  }
}
