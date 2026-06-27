import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReorderRequestsService } from './reorder-requests.service';
import { GetReorderRequestsDto } from './dto/get-reorder-requests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';
import { ReorderRequestStatus } from './entities/reorder-request.entity';

@ApiTags('📦 Reorder Requests')
@Controller('reorder-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReorderRequestsController {
  constructor(private readonly reorderService: ReorderRequestsService) {}

  @Get()
  @Roles(
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
    Permission.SUPPLIER,
  )
  @ApiOperation({ summary: 'List reorder requests' })
  findAll(@Req() req: any, @Query() query: GetReorderRequestsDto) {
    return this.reorderService.findAll(query, req.user);
  }

  @Get('stats')
  @Roles(
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
    Permission.SUPPLIER,
  )
  @ApiOperation({ summary: 'Reorder request statistics' })
  getStats(@Req() req: any) {
    return this.reorderService.getStats(req.user);
  }

  @Post('run-auto')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER)
  @ApiOperation({ summary: 'Run automated low-stock reorder scan now' })
  runAuto() {
    return this.reorderService.runAutoReorder();
  }

  @Post(':id/notify')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Resend supplier reorder alert email/contact message' })
  notify(@Param('id', ParseIntPipe) id: number) {
    return this.reorderService.notifySupplier(id);
  }

  @Put(':id/status')
  @Roles(
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
    Permission.SUPPLIER,
  )
  @ApiOperation({ summary: 'Update reorder request status' })
  updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ReorderRequestStatus,
  ) {
    return this.reorderService.updateStatus(id, status, req.user);
  }
}
