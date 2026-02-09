import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportDto, ImportResponseDto } from './dto/create-import.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/auth/auth.guard";
import { Roles } from "../../common/decorators/role.decorator";
import { PermissionType } from '../../common/enums/PermissionType.enum';
@ApiTags('Imports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('attributes')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Import attributes',
    description: 'Bulk import product attributes from CSV data. Requires appropriate permissions.'
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Attribute import started successfully',
    type: ImportResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions'
  })
  async importAttributes(@Body() importAttributesDto: ImportDto): Promise<ImportResponseDto> {
    return this.importsService.importAttributes(importAttributesDto);
  }

  @Post('products')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Import products',
    description: 'Bulk import products from CSV data. Requires appropriate permissions.'
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Product import started successfully',
    type: ImportResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions'
  })
  async importProducts(@Body() importProductsDto: ImportDto): Promise<ImportResponseDto> {
    return this.importsService.importProducts(importProductsDto);
  }

  @Post('variation-options')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Import variation options',
    description: 'Bulk import product variation options from CSV data. Requires appropriate permissions.'
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Variation options import started successfully',
    type: ImportResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions'
  })
  async importVariationOptions(@Body() importVariationOptionsDto: ImportDto): Promise<ImportResponseDto> {
    return this.importsService.importVariationOptions(importVariationOptionsDto);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({
    summary: 'Get all imports',
    description: 'Retrieve a list of all import jobs with their status.'
  })
  @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Filter by shop ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of imports retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions'
  })
  async findAll(@Query('shop_id') shop_id?: number) {
    return this.importsService.findAll(shop_id);
  }

  @Get(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({
    summary: 'Get import by ID',
    description: 'Retrieve a specific import job by its ID.'
  })
  @ApiParam({ name: 'id', description: 'Import job ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import job retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import job not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.importsService.findOne(id);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete import',
    description: 'Permanently delete an import job. Requires admin privileges.'
  })
  @ApiParam({ name: 'id', description: 'Import job ID', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Import job deleted successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import job not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.importsService.remove(id);
  }
}