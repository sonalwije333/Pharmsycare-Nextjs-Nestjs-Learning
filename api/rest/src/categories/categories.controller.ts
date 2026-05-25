// categories/categories.controller.ts
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto, CategoryPaginator } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('📁 Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new category (Admin/Store Owner only)',
  })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: Category,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateCategoryDto })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve paginated list of all categories (Public)',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    type: CategoryPaginator,
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'parent', required: false })
  @ApiQuery({ name: 'language', required: false })
  findAll(@Query() query: GetCategoriesDto): Promise<CategoryPaginator> {
    return this.categoriesService.getCategories(query);
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get category by ID or slug',
    description: 'Retrieve category details by ID or slug (Public)',
  })
  @ApiParam({
    name: 'param',
    description: 'Category ID or slug',
    example: '1 or fruits-vegetables',
  })
  @ApiOkResponse({
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiQuery({ name: 'language', required: false })
  findOne(
    @Param('param') param: string,
    @Query('language') language: string,
  ): Promise<Category> {
    return this.categoriesService.getCategory(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update category',
    description: 'Update category information by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiBody({ type: UpdateCategoryDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Permanently delete a category by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.categoriesService.remove(id);
  }
}
