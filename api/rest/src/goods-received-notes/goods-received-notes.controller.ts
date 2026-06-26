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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoodsReceivedNotesService } from './goods-received-notes.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { GetGrnsDto } from './dto/get-grns.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';

@ApiTags('📦 Goods Received Notes')
@Controller('goods-received-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class GoodsReceivedNotesController {
  constructor(private readonly grnService: GoodsReceivedNotesService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'List goods received notes' })
  findAll(@Query() query: GetGrnsDto) {
    return this.grnService.findAll(query);
  }

  @Get('stats')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Goods received note statistics' })
  getStats() {
    return this.grnService.getStats();
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Get a goods received note by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grnService.findOne(id);
  }

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Create a goods received note' })
  create(@Body() dto: CreateGrnDto, @Req() req: any) {
    return this.grnService.create(dto, req?.user?.id);
  }

  @Put(':id/receive')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Mark a GRN as received and update stock' })
  receive(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.grnService.receive(id, req?.user?.id);
  }

  @Put(':id/cancel')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({ summary: 'Cancel a draft goods received note' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.grnService.cancel(id);
  }
}
