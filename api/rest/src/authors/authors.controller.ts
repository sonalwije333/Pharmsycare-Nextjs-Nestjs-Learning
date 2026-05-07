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
import { AuthorsService } from './authors.service';
import { AuthorPaginator, GetAuthorDto } from './dto/get-author.dto';
import { GetTopAuthorsDto } from './dto/get-top-authors.dto';
import { Author } from './entities/author.entity';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission, SortOrder } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';


@ApiTags('✍️ Authors')
@Controller('authors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new author',
    description: 'Creates a new author (Admin/Store Owner only)',
  })
  @ApiCreatedResponse({
    description: 'Author created successfully',
    type: () => Author,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateAuthorDto })
  create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all authors',
    description: 'Retrieve paginated list of all authors (Public)',
  })
  @ApiOkResponse({
    description: 'Authors retrieved successfully',
    type: AuthorPaginator,
  })
  findAll(@Query() query: GetAuthorDto): Promise<AuthorPaginator> {
    return this.authorsService.findAll(query);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get author by slug',
    description: 'Retrieve author details by slug (Public)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Author slug',
    example: 'kaity-lerry',
    type: String,
  })
  @ApiOkResponse({
    description: 'Author retrieved successfully',
    type: () => Author,
  })
  @ApiNotFoundResponse({ description: 'Author not found' })
  findOne(@Param('slug') slug: string): Promise<Author> {
    return this.authorsService.findOne(slug);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update author',
    description: 'Update author information by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'Author ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Author updated successfully',
    type: () => Author,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Author not found' })
  @ApiBody({ type: UpdateAuthorDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Delete author',
    description: 'Soft delete an author by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'Author ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Author deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Author not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.authorsService.remove(id);
  }
}

@ApiTags('✍️ Authors')
@Controller('authors')
@Public()
export class TopAuthorsController {
  constructor(private authorsService: AuthorsService) {}

  @Get('top')
  @ApiOperation({
    summary: 'Get top authors',
    description: 'Retrieve list of top authors by products count (Public)',
  })
  @ApiOkResponse({
    description: 'Top authors retrieved successfully',
    type: () => [Author],
  })
  getTopAuthors(@Query() query: GetTopAuthorsDto): Promise<Author[]> {
    return this.authorsService.getTopAuthors(query);
  }
}