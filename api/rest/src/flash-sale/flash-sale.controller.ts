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
import { Permission, SortOrder } from '../common/enums/enums';
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
    type: () => FlashSale,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateFlashSaleDto })
  create(@Body() createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSale> {
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
  findAll(@Query() query: GetFlashSaleDto): Promise<FlashSalePaginator> {
    return this.flashSaleService.findAll(query);
  }

  @Get(':param((?!products$)[^/]+)')
  @Public()
  @ApiOperation({
    summary: 'Get flash sale by ID or slug',
    description: 'Retrieve flash sale details by ID or slug (Public)',
  })
  @ApiParam({
    name: 'param',
    description: 'Flash sale ID or slug',
    example: '1 or limited-time-offer-act-fast',
    type: String,
  })
  @ApiOkResponse({
    description: 'Flash sale retrieved successfully',
    type: () => FlashSale,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  findOne(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<FlashSale> {
    return this.flashSaleService.findOne(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update flash sale',
    description: 'Update flash sale information by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Flash sale ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Flash sale updated successfully',
    type: () => FlashSale,
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
    description: 'Soft delete a flash sale by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Flash sale ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Flash sale deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.flashSaleService.remove(id);
  }
}

@ApiTags('⚡ Flash Sales')
@Controller('flash-sale')
@Public()
export class ProductsByFlashSaleController {
  constructor(private flashSaleService: FlashSaleService) {}

  @Get('products')
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
        current_page: { type: 'number', example: 1 },
        per_page: { type: 'number', example: 15 },
        total: { type: 'number', example: 100 },
        last_page: { type: 'number', example: 10 },
      },
    },
  })
  findAllProducts(@Query() query: GetFlashSaleDto): Promise<any> {
    return this.flashSaleService.findAllProductsByFlashSale(query);
  }

  @Get(':flashSaleId/products')
  @ApiOperation({
    summary: 'Get products by flash sale ID',
    description: 'Retrieve products for a specific flash sale',
  })
  @ApiParam({ 
    name: 'flashSaleId', 
    description: 'Flash sale ID', 
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        flashSale: { type: 'object' },
        current_page: { type: 'number' },
        per_page: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  getProductsByFlashSaleId(
    @Param('flashSaleId', ParseIntPipe) flashSaleId: number,
    @Query() query: GetFlashSaleDto,
  ): Promise<any> {
    return this.flashSaleService.getProductsByFlashSaleId(flashSaleId, query);
  }
}