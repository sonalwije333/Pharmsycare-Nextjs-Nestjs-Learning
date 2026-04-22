// uploads/uploads.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadResponseDto, UploadsResponseDto, UploadPaginatorDto } from './dto/upload-response.dto';
import { DeleteUploadDto } from './dto/delete-upload.dto';
import { GetUploadsDto } from './dto/get-uploads.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';
import { UploadFile } from 'src/common/types/upload-file.type';

@ApiTags('Attachments')
@Controller('attachments')
@UseGuards(JwtAuthGuard, RolesGuard) 
 @ApiBearerAuth('JWT-auth')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @Public()
  @UseInterceptors(FilesInterceptor('attachment[]', 20))
  @ApiOperation({
    summary: 'Upload files',
    description: 'Upload one or multiple files (images, documents, etc.) - Max 20 files per request'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        'attachment[]': {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Files uploaded successfully',
    type: UploadsResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid file format or no files uploaded' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async uploadFile(@UploadedFiles() attachments: UploadFile[]): Promise<UploadsResponseDto> {
    return this.uploadsService.uploadFiles(attachments);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all uploads',
    description: 'Retrieve paginated list of all uploaded files'
  })
  @ApiOkResponse({
    description: 'Uploads retrieved successfully',
    type: UploadPaginatorDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by filename' })
  @ApiQuery({ name: 'mimetype', required: false, type: String, description: 'Filter by mime type' })
  async findAll(@Query() query: GetUploadsDto): Promise<UploadPaginatorDto> {
    return this.uploadsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get upload by ID',
    description: 'Retrieve a specific uploaded file by ID'
  })
  @ApiParam({ name: 'id', description: 'Upload ID', type: String })
  @ApiOkResponse({
    description: 'Upload retrieved successfully',
    type: UploadResponseDto
  })
  @ApiNotFoundResponse({ description: 'Upload not found' })
  async findOne(@Param('id') id: string): Promise<UploadResponseDto> {
    return this.uploadsService.findOne(id);
  }

  @Delete(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete upload',
    description: 'Permanently delete an uploaded file by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Upload ID', type: String })
  @ApiOkResponse({
    description: 'Upload deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Upload not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async remove(@Param('id') id: string): Promise<CoreMutationOutput> {
    return this.uploadsService.remove(id);
  }

  @Delete()
   @Roles(Permission.SUPER_ADMIN) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete multiple uploads',
    description: 'Permanently delete multiple uploaded files by IDs (Admin only)'
  })
  @ApiOkResponse({
    description: 'Uploads deleted successfully',
    type: CoreMutationOutput
  })
  @ApiBadRequestResponse({ description: 'Invalid IDs provided' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: DeleteUploadDto })
  async removeMany(@Body() deleteUploadDto: DeleteUploadDto): Promise<CoreMutationOutput> {
    return this.uploadsService.removeMany(deleteUploadDto.ids);
  }
}