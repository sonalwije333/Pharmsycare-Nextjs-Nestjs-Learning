import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, ProductsPaginator, GetBestSellingProductsDto, GetPopularProductsDto } from './dto/get-products.dto';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product successfully created', type: Product })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 409, description: 'Product slug already exists' })
    create(@Body() createProductDto: CreateProductDto): Promise<Product> {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products with pagination' })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully', type: ProductsPaginator })
    findAll(@Query() query: GetProductsDto): Promise<ProductsPaginator> {
        return this.productsService.getProductsPaginated(query);
    }

    @Get('best-selling')
    @ApiOperation({ summary: 'Get best selling products' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'shop_id', required: false })
    @ApiQuery({ name: 'type_slug', required: false })
    @ApiResponse({ status: 200, description: 'Best selling products retrieved', type: [Product] })
    getBestSelling(@Query() query: GetBestSellingProductsDto): Promise<Product[]> {
        return this.productsService.getBestSellingProducts(query);
    }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular products' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'shop_id', required: false })
    @ApiQuery({ name: 'type_slug', required: false })
    @ApiResponse({ status: 200, description: 'Popular products retrieved', type: [Product] })
    getPopular(@Query() query: GetPopularProductsDto): Promise<Product[]> {
        return this.productsService.getPopularProducts(query);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get product by slug' })
    @ApiParam({ name: 'slug', description: 'Product slug' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully', type: Product })
    @ApiResponse({ status: 404, description: 'Product not found' })
    getBySlug(@Param('slug') slug: string): Promise<Product> {
        return this.productsService.getProductBySlug(slug);
    }

    @Get('id/:id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully', type: Product })
    @ApiResponse({ status: 404, description: 'Product not found' })
    getById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
        return this.productsService.getProductById(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product updated successfully', type: Product })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 409, description: 'Product slug already exists' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 204, description: 'Product deleted successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.productsService.remove(id);
    }
}