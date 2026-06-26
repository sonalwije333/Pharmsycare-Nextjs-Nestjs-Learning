// manufacturers/manufacturers.controller.ts
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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
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
import { Public } from 'src/common/decorators/public.decorator';

import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from "src/common/enums/enums";

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
    type: Manufacturer
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateManufacturerDto })
  createManufacturer(@Body() createManufactureDto: CreateManufacturerDto) {
    return this.manufacturersService.create(createManufactureDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all manufacturers',
    description: 'Retrieve paginated list of manufacturers with filtering'
  })
  @ApiOkResponse({
    description: 'Manufacturers retrieved successfully',
    type: ManufacturerPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getManufactures(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    query: GetManufacturersDto,
  ): Promise<ManufacturerPaginator> {
    return this.manufacturersService.getManufactures(query);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get manufacturer by slug',
    description: 'Retrieve manufacturer details by slug'
  })
  @ApiParam({ name: 'slug', description: 'Manufacturer slug', example: 'too-cool-publication' })
  @ApiOkResponse({
    description: 'Manufacturer retrieved successfully',
    type: Manufacturer
  })
  @ApiNotFoundResponse({ description: 'Manufacturer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getManufactureBySlug(
    @Param('slug') slug: string,
  ): Promise<Manufacturer> {
    return this.manufacturersService.getManufacturesBySlug(slug);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update manufacturer',
    description: 'Update manufacturer by ID (Admin or Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Manufacturer ID', type: Number })
  @ApiOkResponse({
    description: 'Manufacturer updated successfully',
    type: Manufacturer
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Manufacturer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateManufacturerDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ) {
    return this.manufacturersService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete manufacturer',
    description: 'Delete manufacturer by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Manufacturer ID', type: Number })
  @ApiOkResponse({
    description: 'Manufacturer deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Manufacturer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.manufacturersService.remove(id);
  }
}

@ApiTags('🏭 Top Manufacturers')
@Controller('top-manufacturers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TopManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get top manufacturers',
    description: 'Retrieve top manufacturers by product count'
  })
  @ApiOkResponse({
    description: 'Top manufacturers retrieved successfully',
    type: [Manufacturer]
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getTopManufactures(
    @Query() query: GetTopManufacturersDto,
  ): Promise<Manufacturer[]> {
    return this.manufacturersService.getTopManufactures(query);
  }
}