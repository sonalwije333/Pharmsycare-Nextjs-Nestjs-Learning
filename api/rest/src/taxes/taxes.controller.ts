// taxes/taxes.controller.ts
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
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { GetTaxesDto, TaxPaginator } from './dto/get-taxes.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Taxes')
@Controller('taxes')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Create a new tax',
    description: 'Creates a new tax rule (Admin only)'
  })
  @ApiCreatedResponse({
    description: 'Tax created successfully',
    type: Tax
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateTaxDto })
  create(@Body() createTaxDto: CreateTaxDto): Promise<Tax> {
    return this.taxesService.create(createTaxDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all taxes',
    description: 'Retrieve paginated list of all tax rules with filtering options'
  })
  @ApiOkResponse({
    description: 'Taxes retrieved successfully',
    type: TaxPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'searchJoin', required: false, enum: ['and', 'or'], description: 'How to join search conditions' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortedBy', required: false, type: String, description: 'Sort direction' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country' })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Filter by state' })
  @ApiQuery({ name: 'is_global', required: false, type: Boolean, description: 'Filter by global status' })
  async findAll(@Query() query: GetTaxesDto): Promise<TaxPaginator> {
    return this.taxesService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get tax by ID',
    description: 'Retrieve a specific tax rule by ID'
  })
  @ApiParam({ name: 'id', description: 'Tax ID', type: Number })
  @ApiOkResponse({
    description: 'Tax retrieved successfully',
    type: Tax
  })
  @ApiNotFoundResponse({ description: 'Tax not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Tax> {
    return this.taxesService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Update tax',
    description: 'Update an existing tax rule by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Tax ID', type: Number })
  @ApiOkResponse({
    description: 'Tax updated successfully',
    type: Tax
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Tax not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateTaxDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaxDto: UpdateTaxDto
  ): Promise<Tax> {
    return this.taxesService.update(id, updateTaxDto);
  }

  @Delete(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete tax',
    description: 'Permanently delete a tax rule (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Tax ID', type: Number })
  @ApiOkResponse({
    description: 'Tax deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Tax not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.taxesService.remove(id);
  }
}