// src/withdraws/withdraws.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { WithdrawsService } from './withdraws.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
import { Withdraw } from './entities/withdraw.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    permissions?: Permission[];
  };
};


@ApiTags('💰 Withdraws')
@Controller('withdraws')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class WithdrawsController {
  constructor(private readonly withdrawsService: WithdrawsService) {}

  @Post()
  @Roles(Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a withdrawal request',
    description: 'Store owners can request a withdrawal from their shop balance'
  })
  @ApiCreatedResponse({
    description: 'Withdrawal request created successfully',
    type: Withdraw
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or insufficient balance' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateWithdrawDto })
  createWithdraw(
    @Body() createWithdrawDto: CreateWithdrawDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Withdraw> {
    return this.withdrawsService.create(createWithdrawDto, req.user.id);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all withdrawals',
    description: 'Retrieve paginated list of withdrawal requests with filtering'
  })
  @ApiOkResponse({
    description: 'Withdrawals retrieved successfully',
    type: WithdrawPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['Approved', 'Pending', 'On hold', 'Rejected', 'Processing'] })
  @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Filter by shop ID' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async withdraws(
    @Query() query: GetWithdrawsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<WithdrawPaginator> {
    return this.withdrawsService.getWithdraws(query, req.user);
  }

  @Get('my-withdraws')
  @Roles(Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get my shop withdrawals',
    description: 'Retrieve withdrawal requests for the authenticated store owner'
  })
  @ApiOkResponse({
    description: 'My withdrawals retrieved successfully',
    type: WithdrawPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getMyWithdraws(
    @Query() query: GetWithdrawsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<WithdrawPaginator> {
    return this.withdrawsService.getMyWithdraws(query, req.user.id);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get withdrawal by ID',
    description: 'Retrieve detailed information about a specific withdrawal request'
  })
  @ApiParam({ name: 'id', description: 'Withdrawal ID', type: Number })
  @ApiOkResponse({
    description: 'Withdrawal retrieved successfully',
    type: Withdraw
  })
  @ApiNotFoundResponse({ description: 'Withdrawal not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized to view this withdrawal' })
  withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<Withdraw> {
    return this.withdrawsService.findOne(id, req.user);
  }

  @Post(':id/approve')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve withdrawal',
    description: 'Approve a pending withdrawal request (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Withdrawal ID', type: Number })
  @ApiOkResponse({
    description: 'Withdrawal approved successfully',
    type: Withdraw
  })
  @ApiNotFoundResponse({ description: 'Withdrawal not found' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: ApproveWithdrawDto })
  approveWithdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWithdrawDto: ApproveWithdrawDto,
  ): Promise<Withdraw> {
    return this.withdrawsService.approveWithdraw(id, updateWithdrawDto);
  }

  @Post(':id/reject')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject withdrawal',
    description: 'Reject a pending withdrawal request (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Withdrawal ID', type: Number })
  @ApiOkResponse({
    description: 'Withdrawal rejected successfully',
    type: Withdraw
  })
  @ApiNotFoundResponse({ description: 'Withdrawal not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  rejectWithdraw(@Param('id', ParseIntPipe) id: number): Promise<Withdraw> {
    return this.withdrawsService.rejectWithdraw(id);
  }

  @Post(':id/process')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process withdrawal',
    description: 'Mark withdrawal as processing (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Withdrawal ID', type: Number })
  @ApiOkResponse({
    description: 'Withdrawal marked as processing',
    type: Withdraw
  })
  @ApiNotFoundResponse({ description: 'Withdrawal not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  processWithdraw(@Param('id', ParseIntPipe) id: number): Promise<Withdraw> {
    return this.withdrawsService.processWithdraw(id);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Delete withdrawal',
    description: 'Delete a pending withdrawal request (Admin or owner only)'
  })
  @ApiParam({ name: 'id', description: 'Withdrawal ID', type: Number })
  @ApiOkResponse({
    description: 'Withdrawal deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Withdrawal not found' })
  @ApiBadRequestResponse({ description: 'Cannot delete processed withdrawal' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  deleteWithdraw(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<CoreMutationOutput> {
    return this.withdrawsService.remove(id, req.user);
  }

  @Get('stats/summary')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get withdrawal statistics',
    description: 'Retrieve summary statistics for withdrawals (Admin only)'
  })
  @ApiOkResponse({
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalWithdraws: { type: 'number', example: 150 },
        totalAmount: { type: 'number', example: 45000 },
        pendingCount: { type: 'number', example: 12 },
        pendingAmount: { type: 'number', example: 3500 },
        approvedCount: { type: 'number', example: 120 },
        approvedAmount: { type: 'number', example: 38000 },
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getStats(): Promise<any> {
    return this.withdrawsService.getStats();
  }
}