import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/PermissionType.enum';
import { OwnershipTransferService } from './ownership-transfer.service';

@ApiTags('Ownership Transfer')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OwnershipTransferController {
  constructor(
    private readonly ownershipTransferService: OwnershipTransferService,
  ) {}

  @Post('transfer-shop-ownership')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Create a shop ownership transfer request' })
  @ApiResponse({ status: 201, description: 'Ownership transfer created' })
  createTransfer(@Body() body: any, @Req() req: any) {
    return this.ownershipTransferService.createTransfer({
      ...body,
      created_by: req.user.id,
    });
  }

  @Get('ownership-transfer')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'List ownership transfer requests' })
  listTransfers(@Query() query: Record<string, any>) {
    return this.ownershipTransferService.listTransfers(query);
  }

  @Get('ownership-transfer/:transactionIdentifier')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Get ownership transfer request details' })
  getTransfer(@Param('transactionIdentifier') transactionIdentifier: string) {
    return this.ownershipTransferService.getTransfer(transactionIdentifier);
  }

  @Put('ownership-transfer/:id')
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update ownership transfer request status' })
  updateTransfer(@Param('id') id: string, @Body() body: any) {
    return this.ownershipTransferService.updateTransfer(Number(id), body);
  }

  @Delete('ownership-transfer/:id')
  @Roles(PermissionType.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an ownership transfer request' })
  removeTransfer(@Param('id') id: string) {
    this.ownershipTransferService.removeTransfer(Number(id));
  }
}