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
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { GetSupportTicketsDto } from './dto/get-support-tickets.dto';
import {
  ReplySupportTicketDto,
  UpdateSupportTicketStatusDto,
} from './dto/update-support-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';

@ApiTags('🎧 Support Tickets')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SupportTicketsController {
  constructor(private readonly supportService: SupportTicketsService) {}

  @Post()
  @Roles(
    Permission.CUSTOMER,
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  )
  @ApiOperation({ summary: 'Submit a support ticket' })
  create(@Req() req: any, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.create(dto, req.user);
  }

  @Get()
  @Roles(
    Permission.CUSTOMER,
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  )
  @ApiOperation({ summary: 'List support tickets (scoped by role)' })
  findAll(@Req() req: any, @Query() query: GetSupportTicketsDto) {
    return this.supportService.findAll(query, req.user);
  }

  @Get('my')
  @Roles(Permission.CUSTOMER, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'List my support tickets' })
  findMy(@Req() req: any, @Query() query: GetSupportTicketsDto) {
    return this.supportService.findAll(query, {
      ...req.user,
      permissions: [Permission.CUSTOMER],
    });
  }

  @Get('stats')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Support ticket statistics' })
  getStats() {
    return this.supportService.getStats();
  }

  @Get(':id')
  @Roles(
    Permission.CUSTOMER,
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  )
  @ApiOperation({ summary: 'Get a support ticket' })
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.supportService.findOne(id, req.user);
  }

  @Post(':id/reply')
  @Roles(
    Permission.CUSTOMER,
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  )
  @ApiOperation({ summary: 'Reply to a support ticket' })
  reply(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return this.supportService.addReply(id, dto, req.user);
  }

  @Put(':id/status')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Update support ticket status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupportTicketStatusDto,
  ) {
    return this.supportService.updateStatus(id, dto.status);
  }
}
