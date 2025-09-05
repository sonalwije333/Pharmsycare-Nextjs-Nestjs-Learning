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
import { PermissionType } from '../../common/enums/enums';
import { Category } from './entities/category.entity';
import {CategoriesPaginator, GetCategoriesDto} from "./dto/get-categories.dto";

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new category', description: 'Creates a new category. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'Category successfully created', type: Category })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all categories', description: 'Retrieves a list of categories with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'parent', required: false, type: String, description: 'Parent category ID filter' })
    @ApiQuery({ name: 'type', required: false, type: String, description: 'Type ID filter' })
    @ApiQuery({ name: 'is_approved', required: false, type: Boolean, description: 'Approval status filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: CategoriesPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getCategories(@Query() query: GetCategoriesDto): Promise<CategoriesPaginator> {
        return this.categoriesService.getCategories(query);
    }

    @Get(':slug')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get category by slug', description: 'Retrieves a specific category by its slug.' })
    @ApiParam({ name: 'slug', description: 'Category slug', type: String })
    @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: Category })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getCategoryBySlug(@Param('slug') slug: string): Promise<Category> {
        return this.categoriesService.getCategoryBySlug(slug);
    }

    @Get('id/:id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get category by ID', description: 'Retrieves a specific category by its ID.' })
    @ApiParam({ name: 'id', description: 'Category ID', type: String })
    @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: Category })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getCategoryById(@Param('id') id: number): Promise<Category> {
        return this.categoriesService.getCategoryById(id);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update category', description: 'Updates an existing category.' })
    @ApiParam({ name: 'id', description: 'Category ID', type: String })
    @ApiResponse({ status: 200, description: 'Category updated successfully', type: Category })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    update(
        @Param('id') id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete category', description: 'Permanently deletes a category. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Category ID', type: String })
    @ApiResponse({ status: 204, description: 'Category deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async remove(@Param('id') id: number) {
        return this.categoriesService.remove(id);
    }
}

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/top-categories')
export class TopCategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get top categories', description: 'Retrieves top categories by product count.' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top categories to retrieve', example: 10 })
    @ApiResponse({ status: 200, description: 'Top categories retrieved successfully', type: [Category] })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    getTopCategories(@Query('limit') limit = 10): Promise<Category[]> {
        return this.categoriesService.getTopCategories(limit);
    }
}