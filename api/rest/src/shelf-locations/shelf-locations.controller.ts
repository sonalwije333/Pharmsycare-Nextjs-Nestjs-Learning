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
import { ShelfLocationsService } from './shelf-locations.service';
import { CreateShelfLocationDto } from './dto/create-shelf-location.dto';
import { UpdateShelfLocationDto } from './dto/update-shelf-location.dto';
import { AssignProductDto } from './dto/assign-product.dto';
import { GetShelfLocationsDto } from './dto/get-shelf-locations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';

@ApiTags('🗺️ Shelf Locations')
@Controller('shelf-locations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ShelfLocationsController {
  constructor(private readonly shelfLocationsService: ShelfLocationsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Create a shelf location' })
  create(@Body() dto: CreateShelfLocationDto) {
    return this.shelfLocationsService.create(dto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'List shelf locations' })
  findAll(@Query() query: GetShelfLocationsDto) {
    return this.shelfLocationsService.findAll(query);
  }

  @Get('layout')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Visual pharmacy floor map grouped by zone' })
  getLayout() {
    return this.shelfLocationsService.getLayout();
  }

  @Get('search')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Search medicines and return their shelf location' })
  search(@Query('text') text?: string) {
    return this.shelfLocationsService.searchProductLocations(text);
  }

  @Get('locate/:productId')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Locate a single product on the shelf map' })
  locate(@Param('productId', ParseIntPipe) productId: number) {
    return this.shelfLocationsService.locateProduct(productId);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Get a shelf location with its products' })
  getShelfProducts(@Param('id', ParseIntPipe) id: number) {
    return this.shelfLocationsService.getShelfProducts(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Update a shelf location' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShelfLocationDto,
  ) {
    return this.shelfLocationsService.update(id, dto);
  }

  @Delete('assignments/:productId')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Remove a product from its shelf' })
  unassign(@Param('productId', ParseIntPipe) productId: number) {
    return this.shelfLocationsService.unassignProduct(productId);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Delete a shelf location' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shelfLocationsService.remove(id);
  }

  @Post(':id/assign-product')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Place / move a product onto a shelf' })
  assignProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProductDto,
  ) {
    return this.shelfLocationsService.assignProduct(id, dto);
  }
}
