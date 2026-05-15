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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ManufacturersService } from './manufacturers.service';
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto';
import { Manufacturer } from './entities/manufacturer.entity';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission, SortOrder } from "src/common/enums/enums";


@ApiTags('🏭 Manufacturers')
@Controller('manufacturers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a manufacturer',
    description: 'Create a new manufacturer (Admin or Store owner only)'
  })
  @ApiCreatedResponse({
    description: 'Manufacturer created successfully',
    type: () => Manufacturer
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateManufacturerDto })
  create(@Body() createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
    return this.manufacturersService.create(createManufacturerDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get all manufacturers',
    description: 'Retrieve paginated list of manufacturers with filtering'
  })
  @ApiOkResponse({
    description: 'Manufacturers retrieved successfully',
    type: () => ManufacturerPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: GetManufacturersDto): Promise<ManufacturerPaginator> {
    return this.manufacturersService.findAll(query);
  }

  @Get(':slug')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get manufacturer by slug',
    description: 'Retrieve manufacturer details by slug'
  })
  @ApiParam({ 
    name: 'slug', 
    description: 'Manufacturer slug', 
    example: 'too-cool-publication',
    type: String,
  })
  @ApiOkResponse({
    description: 'Manufacturer retrieved successfully',
    type: () => Manufacturer
  })
  @ApiNotFoundResponse({ description: 'Manufacturer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('slug') slug: string): Promise<Manufacturer> {
    return this.manufacturersService.findOne(slug);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update manufacturer',
    description: 'Update manufacturer by ID (Admin or Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Manufacturer ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Manufacturer updated successfully',
    type: () => Manufacturer
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Manufacturer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateManufacturerDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ): Promise<Manufacturer> {
    return this.manufacturersService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete manufacturer',
    description: 'Soft delete manufacturer by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Manufacturer ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Manufacturer deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Manufacturer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.manufacturersService.remove(id);
  }
}

@ApiTags('🏭 Manufacturers')
@Controller('manufacturers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TopManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Get('top')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get top manufacturers',
    description: 'Retrieve top manufacturers by product count'
  })
  @ApiOkResponse({
    description: 'Top manufacturers retrieved successfully',
    type: () => [Manufacturer]
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getTop(@Query() query: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return this.manufacturersService.getTopManufacturers(query);
  }
}