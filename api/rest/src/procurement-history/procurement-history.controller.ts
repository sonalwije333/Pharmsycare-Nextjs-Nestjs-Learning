import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProcurementHistoryService } from './procurement-history.service';
import { CreateProcurementRecordDto } from './dto/create-procurement-record.dto';
import { GetProcurementHistoryDto } from './dto/get-procurement-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';

@ApiTags('🧾 Procurement History')
@Controller('procurement-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProcurementHistoryController {
  constructor(
    private readonly procurementService: ProcurementHistoryService,
  ) {}

  @Get()
  @Roles(
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  )
  @ApiOperation({ summary: 'List procurement history' })
  findAll(@Query() query: GetProcurementHistoryDto) {
    return this.procurementService.findAll(query);
  }

  @Get('stats')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Procurement history statistics' })
  getStats() {
    return this.procurementService.getStats();
  }

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER)
  @ApiOperation({ summary: 'Manually record a procurement entry' })
  create(@Body() dto: CreateProcurementRecordDto) {
    return this.procurementService.create(dto);
  }

  @Put(':id/receive')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Mark a procurement entry as received' })
  markReceived(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.markReceived(id);
  }
}
