import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { GetTypesDto, TypesPaginator } from './dto/get-types.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Type } from './entities/type.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Types')
@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product type',
    description:
      'Add a new product type to the system. Requires admin or store owner privileges.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Type successfully created',
    type: Type,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Type slug already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  createType(@Body() createTypeDto: CreateTypeDto): Promise<Type> {
    return this.typesService.create(createTypeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List product types',
    description: 'Get paginated list of product types with filters',
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
    description: 'Search query',
  })
  @ApiQuery({
    name: 'text',
    required: false,
    type: String,
    description: 'Search text',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: [Object],
    description: 'Order by clauses',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Types retrieved successfully',
    type: TypesPaginator,
  })
  async getTypes(@Query() query: GetTypesDto): Promise<TypesPaginator> {
    return this.typesService.getTypesPaginated(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all types',
    description: 'Retrieve all product types without pagination',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All types retrieved successfully',
    type: [Type],
  })
  async getAllTypes(@Query('language') language?: string): Promise<Type[]> {
    return this.typesService.getAllTypes(language);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get type details',
    description: 'Retrieve specific product type by slug',
  })
  @ApiParam({ name: 'slug', description: 'Type slug', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type details retrieved successfully',
    type: Type,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Type not found' })
  async getTypeBySlug(@Param('slug') slug: string): Promise<Type> {
    return this.typesService.getTypeBySlug(slug);
  }

  @Get('id/:id')
  @ApiOperation({
    summary: 'Get type by ID',
    description: 'Retrieve specific product type by ID',
  })
  @ApiParam({ name: 'id', description: 'Type ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type retrieved successfully',
    type: Type,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Type not found' })
  async getTypeById(@Param('id', ParseIntPipe) id: number): Promise<Type> {
    return this.typesService.getTypeById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update product type',
    description: 'Modify existing product type details',
  })
  @ApiParam({ name: 'id', description: 'Type ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type updated successfully',
    type: Type,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Type not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Type slug already exists',
  })
  async updateType(
    @Param('id') id: string,
    @Body() updateTypeDto: UpdateTypeDto,
  ): Promise<Type> {
    return this.typesService.update(id, updateTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product type',
    description: 'Permanently remove a product type',
  })
  @ApiParam({ name: 'id', description: 'Type ID', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Type deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Type not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Type is in use by categories or products',
  })
  async deleteType(@Param('id') id: string): Promise<void> {
    return this.typesService.remove(id);
  }
}
