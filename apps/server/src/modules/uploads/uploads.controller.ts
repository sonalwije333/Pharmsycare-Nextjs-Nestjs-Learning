import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Get,
    Param,
    Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Attachments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/attachments')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @UseInterceptors(FilesInterceptor('attachments[]'))
    @ApiOperation({
        summary: 'Upload attachments',
        description: 'Upload multiple files/attachments. Supports various file types.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File attachments',
        schema: {
            type: 'object',
            properties: {
                'attachments[]': {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Array of files to upload',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Files uploaded successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '883' },
                    original: {
                        type: 'string',
                        example: 'https://bucket.s3.amazonaws.com/881/file.png'
                    },
                    thumbnail: {
                        type: 'string',
                        example: 'https://bucket.s3.amazonaws.com/881/conversions/file-thumbnail.jpg'
                    },
                    filename: { type: 'string', example: 'file.png' },
                    size: { type: 'number', example: 1024 },
                    mimeType: { type: 'string', example: 'image/png' },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Bad request - invalid file format' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 413, description: 'Payload too large - file size exceeded' })
    async uploadFiles(@UploadedFiles() attachments: Array<Express.Multer.File>) {
        return this.uploadsService.uploadFiles(attachments);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({
        summary: 'Get all attachments',
        description: 'Retrieve a list of all uploaded attachments. Requires admin privileges.'
    })
    @ApiResponse({
        status: 200,
        description: 'Attachments retrieved successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    findAll() {
        return this.uploadsService.findAll();
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({
        summary: 'Get attachment by ID',
        description: 'Retrieve a specific attachment by its ID.'
    })
    @ApiParam({ name: 'id', description: 'Attachment ID' })
    @ApiResponse({
        status: 200,
        description: 'Attachment retrieved successfully'
    })
    @ApiResponse({ status: 404, description: 'Attachment not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    findOne(@Param('id') id: string) {
        return this.uploadsService.findOne(+id);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({
        summary: 'Delete attachment',
        description: 'Permanently delete an attachment. Requires admin privileges.'
    })
    @ApiParam({ name: 'id', description: 'Attachment ID' })
    @ApiResponse({
        status: 200,
        description: 'Attachment deleted successfully'
    })
    @ApiResponse({ status: 404, description: 'Attachment not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    remove(@Param('id') id: string) {
        return this.uploadsService.remove(+id);
    }
}