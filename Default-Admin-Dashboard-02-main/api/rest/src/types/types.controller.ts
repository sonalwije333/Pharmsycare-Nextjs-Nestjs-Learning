// types/types.controller.ts
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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { GetTypesDto, TypePaginator } from './dto/get-types.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';

@ApiTags('Types')
@Controller('types')
 @UseGuards(JwtAuthGuard, RolesGuard) 
 @ApiBearerAuth('JWT-auth')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Post()
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Create a new type',
    description: 'Creates a new product type (Admin only)'
  })
  @ApiCreatedResponse({
    description: 'Type created successfully',
    type: Type
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateTypeDto })
  create(@Body() createTypeDto: CreateTypeDto): Promise<Type> {
    return this.typesService.create(createTypeDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all types',
    description: 'Retrieve paginated list of all product types with filtering options'
  })
  @ApiOkResponse({
    description: 'Types retrieved successfully',
    type: TypePaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Filter by language' })
  findAll(@Query() query: GetTypesDto): Promise<TypePaginator> {
    return this.typesService.findAll(query);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get type by slug',
    description: 'Retrieve a specific type by slug'
  })
  @ApiParam({ name: 'slug', description: 'Type slug', example: 'grocery' })
  @ApiOkResponse({
    description: 'Type retrieved successfully',
    type: Type
  })
  @ApiNotFoundResponse({ description: 'Type not found' })
  getTypeBySlug(@Param('slug') slug: string): Promise<Type> {
    return this.typesService.getTypeBySlug(slug);
  }

  @Put(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Update type',
    description: 'Update an existing type by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Type ID', type: Number })
  @ApiOkResponse({
    description: 'Type updated successfully',
    type: Type
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Type not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateTypeDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTypeDto: UpdateTypeDto
  ): Promise<Type> {
    return this.typesService.update(id, updateTypeDto);
  }

  @Delete(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete type',
    description: 'Permanently delete a type by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Type ID', type: Number })
  @ApiOkResponse({
    description: 'Type deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Type not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.typesService.remove(id);
  }
}