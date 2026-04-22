// shipping/shippings.controller.ts
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
  UsePipes,
  ValidationPipe
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
  ApiCreatedResponse
} from '@nestjs/swagger';
import { ShippingsService } from './shippings.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { GetShippingsDto, ShippingPaginator } from './dto/get-shippings.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping, ShippingType } from './entities/shipping.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';


import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Shippings')
@Controller('shippings')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class ShippingsController {
  constructor(private readonly shippingsService: ShippingsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Create a new shipping method',
    description: 'Creates a new shipping method (Admin/Store owner only)'
  })
  @ApiCreatedResponse({
    description: 'Shipping method created successfully',
    type: Shipping
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateShippingDto })
  create(@Body() createShippingDto: CreateShippingDto): Promise<Shipping> {
    return this.shippingsService.create(createShippingDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all shipping methods',
    description: 'Retrieve paginated list of all shipping methods with filtering options'
  })
  @ApiOkResponse({
    description: 'Shipping methods retrieved successfully',
    type: ShippingPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'searchJoin', required: false, type: String, description: 'Search join operator' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortedBy', required: false, type: String, description: 'Sort direction' })
  @ApiQuery({ name: 'is_global', required: false, type: Boolean, description: 'Filter by global status' })
  @ApiQuery({ name: 'type', required: false, enum: ShippingType, description: 'Filter by shipping type' })
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  findAll(@Query() query: Record<string, any>): Promise<ShippingPaginator> {
    return this.shippingsService.findAll(query as GetShippingsDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get shipping method by ID',
    description: 'Retrieve a specific shipping method by ID'
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiOkResponse({
    description: 'Shipping method retrieved successfully',
    type: Shipping
  })
  @ApiNotFoundResponse({ description: 'Shipping method not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Shipping> {
    return this.shippingsService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Update shipping method',
    description: 'Update an existing shipping method by ID (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiOkResponse({
    description: 'Shipping method updated successfully',
    type: Shipping
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Shipping method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateShippingDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShippingDto: UpdateShippingDto
  ): Promise<Shipping> {
    return this.shippingsService.update(id, updateShippingDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete shipping method',
    description: 'Permanently delete a shipping method (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Shipping ID', type: Number })
  @ApiOkResponse({
    description: 'Shipping method deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Shipping method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.shippingsService.remove(id);
  }
}