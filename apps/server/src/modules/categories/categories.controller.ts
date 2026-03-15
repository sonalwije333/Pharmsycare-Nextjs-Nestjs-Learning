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
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Category } from './entities/category.entity';
import {
  CategoriesPaginator,
  GetCategoriesDto,
} from './dto/get-categories.dto';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category. Requires admin or store owner privileges.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category successfully created',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category slug already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent category or type not found',
  })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieves a list of categories with filtering and pagination.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiQuery({
    name: 'parent',
    required: false,
    type: String,
    description: 'Parent category ID filter',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Type ID filter',
  })
  @ApiQuery({
    name: 'is_approved',
    required: false,
    type: Boolean,
    description: 'Approval status filter',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT', 'PRODUCTS_COUNT'],
    description: 'Order by column',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: CategoriesPaginator,
  })
  async getCategories(
    @Query() query: GetCategoriesDto,
  ): Promise<CategoriesPaginator> {
    return this.categoriesService.getCategories(query);
  }

  @Get('top')
  @ApiOperation({
    summary: 'Get top categories',
    description: 'Retrieves top categories by product count.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top categories to retrieve',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Top categories retrieved successfully',
    type: [Category],
  })
  async getTopCategories(@Query('limit') limit = 10): Promise<Category[]> {
    return this.categoriesService.getTopCategories(limit);
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get category tree',
    description:
      'Retrieves categories in a tree structure with parent-child relationships.',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category tree retrieved successfully',
    type: [Category],
  })
  async getCategoryTree(
    @Query('language') language?: string,
  ): Promise<Category[]> {
    return this.categoriesService.getCategoryTree(language);
  }

  @Get('by-type/:typeId')
  @ApiOperation({
    summary: 'Get categories by type',
    description: 'Retrieves all categories belonging to a specific type.',
  })
  @ApiParam({ name: 'typeId', description: 'Type ID', type: String })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: [Category],
  })
  async getCategoriesByType(
    @Param('typeId') typeId: string,
    @Query('language') language?: string,
  ): Promise<Category[]> {
    return this.categoriesService.getCategoriesByType(typeId, language);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieves a specific category by its slug.',
  })
  @ApiParam({ name: 'slug', description: 'Category slug', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async getCategoryBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoriesService.getCategoryBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a specific category by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category> {
    return this.categoriesService.getCategoryById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing category.',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category slug already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
    description:
      'Permanently deletes a category. Will fail if category has child categories.',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category has child categories',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Approve category',
    description: 'Approves a category. Requires super admin privileges.',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category approved successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async approveCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category> {
    return this.categoriesService.approveCategory(id);
  }

  @Post(':id/disapprove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Disapprove category',
    description: 'Disapproves a category. Requires super admin privileges.',
  })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category disapproved successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async disapproveCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category> {
    return this.categoriesService.disapproveCategory(id);
  }
}
