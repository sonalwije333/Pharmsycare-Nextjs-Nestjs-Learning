// flash-sale/flash-sale.controller.ts
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
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { FlashSaleService } from './flash-sale.service';
import { GetFlashSaleDto, FlashSalePaginator } from './dto/get-flash-sales.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { FlashSale } from './entities/flash-sale.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('⚡ Flash Sales')
@Controller('flash-sale')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FlashSaleController {
  constructor(private flashSaleService: FlashSaleService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create a new flash sale',
    description: 'Creates a new flash sale (Admin only)',
  })
  @ApiCreatedResponse({
    description: 'Flash sale created successfully',
    type: FlashSale,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateFlashSaleDto })
  createFlashSale(
    @Body() createFlashSaleDto: CreateFlashSaleDto,
  ): Promise<FlashSale> {
    return this.flashSaleService.create(createFlashSaleDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all flash sales',
    description: 'Retrieve paginated list of all flash sales (Public)',
  })
  @ApiOkResponse({
    description: 'Flash sales retrieved successfully',
    type: FlashSalePaginator,
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'sale_status', required: false })
  findAll(@Query() query: Record<string, any>): Promise<FlashSalePaginator> {
    return this.flashSaleService.findAllFlashSale(query);
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get flash sale by ID or slug',
    description: 'Retrieve flash sale details by ID or slug (Public)',
  })
  @ApiParam({
    name: 'param',
    description: 'Flash sale ID or slug',
    example: '1 or limited-time-offer-act-fast',
  })
  @ApiOkResponse({
    description: 'Flash sale retrieved successfully',
    type: FlashSale,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  @ApiQuery({ name: 'language', required: false })
  getFlashSale(
    @Param('param') param: string,
    @Query('language') language: string,
  ): Promise<FlashSale> {
    return this.flashSaleService.getFlashSale(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update flash sale',
    description: 'Update flash sale information by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Flash sale ID', type: Number })
  @ApiOkResponse({
    description: 'Flash sale updated successfully',
    type: FlashSale,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  @ApiBody({ type: UpdateFlashSaleDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<FlashSale> {
    return this.flashSaleService.update(id, updateFlashSaleDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete flash sale',
    description: 'Permanently delete a flash sale by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Flash sale ID', type: Number })
  @ApiOkResponse({
    description: 'Flash sale deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  deleteFlashSale(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CoreMutationOutput> {
    return this.flashSaleService.remove(id);
  }
}

@ApiTags('⚡ Flash Sales - Products')
@Controller('products-by-flash-sale')
@Public()
export class ProductsByFlashSaleController {
  constructor(private flashSaleService: FlashSaleService) {}

  @Get()
  @ApiOperation({
    summary: 'Get products by flash sale',
    description: 'Retrieve paginated list of products by flash sale (Public)',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        current_page: { type: 'number' },
        per_page: { type: 'number' },
        total: { type: 'number' },
        last_page: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: Record<string, any>): Promise<any> {
    return this.flashSaleService.findAllProductsByFlashSale(query);
  }

  @Get(':flashSaleId')
  @ApiOperation({
    summary: 'Get products by flash sale ID',
    description: 'Retrieve products for a specific flash sale',
  })
  @ApiParam({ name: 'flashSaleId', description: 'Flash sale ID', type: Number })
  getProductsByFlashSaleId(
    @Param('flashSaleId', ParseIntPipe) flashSaleId: number,
    @Query() query: Record<string, any>,
  ): Promise<any> {
    return this.flashSaleService.getProductsByFlashSaleId(flashSaleId, query);
  }
}

@ApiTags('⚡ Flash Sale Vendor Requests')
@Controller('vendor-requests-for-flash-sale')
@Public()
export class VendorRequestsForFlashSaleController {
  constructor(private flashSaleService: FlashSaleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create vendor request for flash sale',
    description: 'Create a new vendor flash-sale request',
  })
  create(@Body() input: Record<string, any>): Promise<any> {
    return this.flashSaleService.createVendorRequestForFlashSale(input);
  }

  @Get()
  @ApiOperation({
    summary: 'Get vendor requests for flash sale',
    description: 'Retrieve paginated vendor requests for flash sale',
  })
  @ApiOkResponse({
    description: 'Vendor requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        current_page: { type: 'number' },
        per_page: { type: 'number' },
        total: { type: 'number' },
        last_page: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: Record<string, any>): Promise<any> {
    return this.flashSaleService.findAllVendorRequestsForFlashSale(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get vendor request for flash sale by ID',
    description: 'Retrieve a single vendor flash-sale request by ID',
  })
  @ApiParam({ name: 'id', description: 'Vendor request ID', type: Number })
  getOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.flashSaleService.getVendorRequestForFlashSale(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update vendor request for flash sale',
    description: 'Update an existing vendor flash-sale request by ID',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: Record<string, any>,
  ): Promise<any> {
    return this.flashSaleService.updateVendorRequestForFlashSale(id, input);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete vendor request for flash sale',
    description: 'Delete a vendor flash-sale request by ID',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.flashSaleService.removeVendorRequestForFlashSale(id);
  }
}

@ApiTags('⚡ Flash Sale Vendor Requests')
@Controller('approve-flash-sale-requested-products')
@Public()
export class ApproveVendorRequestForFlashSaleController {
  constructor(private flashSaleService: FlashSaleService) {}

  @Post()
  approve(@Body('id') id: number): Promise<any> {
    return this.flashSaleService.approveVendorRequestForFlashSale(Number(id));
  }
}

@ApiTags('⚡ Flash Sale Vendor Requests')
@Controller('disapprove-flash-sale-requested-products')
@Public()
export class DisapproveVendorRequestForFlashSaleController {
  constructor(private flashSaleService: FlashSaleService) {}

  @Post()
  disapprove(@Body('id') id: number): Promise<any> {
    return this.flashSaleService.disapproveVendorRequestForFlashSale(Number(id));
  }
}
