import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.getProductsPaginated(query);
  }

  // @Get(':slug')
  // getCategoryBySlug(@Param('slug') slug: string) {
  //   return this.categoriesService.getCategoryBySlug(slug);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateTypeDto: UpdateCategoryDto) {
  //   return this.categoriesService.update(id, updateTypeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(id);
  // }
}
