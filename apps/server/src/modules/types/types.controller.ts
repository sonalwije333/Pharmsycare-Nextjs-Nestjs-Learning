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
} from '@nestjs/common';
import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { GetTypesDto, TypesPaginator } from './dto/get-types.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Type } from './entities/type.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/PermissionType.enum';
@ApiTags('Types')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/types')
export class TypesController {
    constructor(private readonly typesService: TypesService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create product type', description: 'Add a new product type to the system' })
    @ApiResponse({ status: 201, description: 'Type created', type: Type })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    createType(@Body() createTypeDto: CreateTypeDto) {
        return this.typesService.create(createTypeDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'List product types', description: 'Get paginated list of product types with filters' })
    @ApiResponse({ status: 200, description: 'Types retrieved', type: TypesPaginator })
    getTypes(@Query() query: GetTypesDto) {
        return this.typesService.getTypesPaginated(query);
    }

    @Get('all')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all types', description: 'Retrieve all product types without pagination' })
    @ApiResponse({ status: 200, description: 'All types retrieved', type: [Type] })
    getAllTypes(@Query('language') language?: string) {
        return this.typesService.getAllTypes(language);
    }

    @Get(':slug')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get type details', description: 'Retrieve specific product type by slug' })
    @ApiParam({ name: 'slug', description: 'Type slug' })
    @ApiResponse({ status: 200, description: 'Type details', type: Type })
    @ApiResponse({ status: 404, description: 'Type not found' })
    getTypeBySlug(@Param('slug') slug: string) {
        return this.typesService.getTypeBySlug(slug);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update product type', description: 'Modify existing product type details' })
    @ApiParam({ name: 'id', description: 'Type ID' })
    @ApiResponse({ status: 200, description: 'Type updated', type: Type })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Type not found' })
    updateType(
        @Param('id') id: string,
        @Body() updateTypeDto: UpdateTypeDto,
    ) {
        return this.typesService.update(id, updateTypeDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({ summary: 'Delete product type', description: 'Permanently remove a product type' })
    @ApiParam({ name: 'id', description: 'Type ID' })
    @ApiResponse({ status: 204, description: 'Type deleted' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Type not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteType(@Param('id') id: string) {
        return this.typesService.remove(id);
    }
}