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
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorPaginator, GetAuthorDto, GetTopAuthorsDto } from './dto/get-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/enums';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Author } from './entities/author.entity';

@ApiTags('Authors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/authors')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new author', description: 'Creates a new author. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'Author successfully created', type: Author })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
        return this.authorsService.create(createAuthorDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all authors', description: 'Retrieves a list of authors with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'is_approved', required: false, type: Boolean, description: 'Approval status filter' })
    @ApiQuery({ name: 'shop_id', required: false, type: String, description: 'Shop ID filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'NAME', 'UPDATED_AT', 'PRODUCTS_COUNT'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Authors retrieved successfully', type: AuthorPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getAuthors(@Query() query: GetAuthorDto): Promise<AuthorPaginator> {
        return this.authorsService.getAuthors(query);
    }

    @Get(':slug')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get author by slug', description: 'Retrieves a specific author by their slug.' })
    @ApiParam({ name: 'slug', description: 'Author slug', type: String })
    @ApiResponse({ status: 200, description: 'Author retrieved successfully', type: Author })
    @ApiResponse({ status: 404, description: 'Author not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getAuthorBySlug(@Param('slug') slug: string): Promise<Author> {
        return this.authorsService.getAuthorBySlug(slug);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update author', description: 'Updates an existing author.' })
    @ApiParam({ name: 'id', description: 'Author ID', type: Number })
    @ApiResponse({ status: 200, description: 'Author updated successfully', type: Author })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Author not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAuthorDto: UpdateAuthorDto,
    ) {
        return this.authorsService.update(id, updateAuthorDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete author', description: 'Permanently deletes an author. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Author ID', type: Number })
    @ApiResponse({ status: 204, description: 'Author deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Author not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.authorsService.remove(id);
    }
}

@ApiTags('Authors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/top-authors')
export class TopAuthorsController {
    constructor(private authorsService: AuthorsService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get top authors', description: 'Retrieves top authors by product count.' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top authors to retrieve', example: 10 })
    @ApiResponse({ status: 200, description: 'Top authors retrieved successfully', type: [Author] })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    getTopAuthors(@Query() query: GetTopAuthorsDto): Promise<Author[]> {
        return this.authorsService.getTopAuthors(query);
    }
}