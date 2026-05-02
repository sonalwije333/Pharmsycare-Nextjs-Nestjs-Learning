import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { Product } from './entities/product.entity';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { GetBestSellingProductsDto } from './dto/get-best-selling-products.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

/* -------------------------------------------------------------------------- */
/*                               MAIN PRODUCTS                                */
/* -------------------------------------------------------------------------- */

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with filters & pagination)' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: ProductPaginator,
  })
  async getProducts(@Query() query: GetProductsDto): Promise<ProductPaginator> {
    return this.productsService.getProducts(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({
    name: 'slug',
    type: String,
    example: 'iphone-15-pro',
  })
  @ApiResponse({
    status: 200,
    description: 'Single product fetched',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.getProductBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}

/* -------------------------------------------------------------------------- */
/*                            POPULAR PRODUCTS                                */
/* -------------------------------------------------------------------------- */

@ApiTags('Products')
@Controller('popular-products')
export class PopularProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get popular products' })
  @ApiResponse({
    status: 200,
    description: 'Popular products list',
    type: [Product],
  })
  async getProducts(@Query() query: GetPopularProductsDto): Promise<Product[]> {
    return this.productsService.getPopularProducts(query);
  }
}

/* -------------------------------------------------------------------------- */
/*                          BEST SELLING PRODUCTS                             */
/* -------------------------------------------------------------------------- */

@ApiTags('Products')
@Controller('best-selling-products')
export class BestSellingProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get best selling products' })
  @ApiResponse({
    status: 200,
    description: 'Best selling products list',
    type: [Product],
  })
  async getProducts(
    @Query() query: GetBestSellingProductsDto,
  ): Promise<Product[]> {
    return this.productsService.getBestSellingProducts(query);
  }
}

/* -------------------------------------------------------------------------- */
/*                              DRAFT PRODUCTS                                */
/* -------------------------------------------------------------------------- */

@ApiTags('Products')
@Controller('draft-products')
export class DraftProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get draft products' })
  @ApiResponse({
    status: 200,
    description: 'Draft products list',
    type: ProductPaginator,
  })
  async getProducts(@Query() query: GetProductsDto): Promise<ProductPaginator> {
    return this.productsService.getDraftProducts(query);
  }
}

/* -------------------------------------------------------------------------- */
/*                             PRODUCTS STOCK                                 */
/* -------------------------------------------------------------------------- */

@ApiTags('Products')
@Controller('products-stock')
export class ProductsStockController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get product stock details' })
  @ApiResponse({
    status: 200,
    description: 'Products stock list',
    type: ProductPaginator,
  })
  async getProducts(@Query() query: GetProductsDto): Promise<ProductPaginator> {
    return this.productsService.getProductsStock(query);
  }
}