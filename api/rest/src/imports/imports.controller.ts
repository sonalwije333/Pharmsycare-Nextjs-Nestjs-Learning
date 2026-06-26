// imports/imports.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';
import { ImportDto } from './dto/create-import.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from "src/common/decorators/roles.decorator";
import { Permission } from '../common/enums/enums';
import { UploadFile } from 'src/common/types/upload-file.type';


@ApiTags('📥 Imports')
@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('import-attributes')
  @Roles(Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('csv'))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Import attributes',
    description: 'Import product attributes from CSV file (Store owner or admin only)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shop_id: { type: 'number', example: 1 },
        csv: {
          type: 'string',
          format: 'binary',
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Import job started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Import started successfully' },
        import_id: { type: 'string', example: 'imp_1234567890' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid file format' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async importAttributes(
    @Body('shop_id') shop_id: string,
    @UploadedFile() csv: UploadFile,
  ) {
    const importDto = new ImportDto();
    importDto.shop_id = parseInt(shop_id);
    // importDto.csv = csv;
    return this.importsService.importAttributes(importDto);
  }

  @Post('import-products')
  @Roles(Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('csv'))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Import products',
    description: 'Import products from CSV file (Store owner or admin only)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shop_id: { type: 'number', example: 1 },
        csv: {
          type: 'string',
          format: 'binary',
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Import job started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Import started successfully' },
        import_id: { type: 'string', example: 'imp_1234567890' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid file format' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async importProducts(
    @Body('shop_id') shop_id: string,
    @UploadedFile() csv: UploadFile,
  ) {
    const importDto = new ImportDto();
    importDto.shop_id = parseInt(shop_id);
    // importDto.csv = csv;
    return this.importsService.importProducts(importDto);
  }

  @Post('import-variation-options')
  @Roles(Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('csv'))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Import variation options',
    description: 'Import product variation options from CSV file (Store owner or admin only)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shop_id: { type: 'number', example: 1 },
        csv: {
          type: 'string',
          format: 'binary',
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Import job started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Import started successfully' },
        import_id: { type: 'string', example: 'imp_1234567890' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid file format' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async importVariationOptions(
    @Body('shop_id') shop_id: string,
    @UploadedFile() csv: UploadFile,
  ) {
    const importDto = new ImportDto();
    importDto.shop_id = parseInt(shop_id);
    // importDto.csv = csv;
    return this.importsService.importVariationOptions(importDto);
  }
}