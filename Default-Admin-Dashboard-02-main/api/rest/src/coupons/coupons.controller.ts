// coupons/coupons.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { GetCouponsDto, CouponPaginator } from './dto/get-coupons.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
  VerifyCouponInput,
  VerifyCouponResponse,
} from './dto/verify-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';;
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🎫 Coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new coupon',
    description: 'Creates a new coupon (Admin/Store Owner only)',
  })
  @ApiCreatedResponse({
    description: 'Coupon created successfully',
    type: Coupon,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateCouponDto })
  createCoupon(@Body() createCouponDto: CreateCouponDto): Promise<Coupon> {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all coupons',
    description: 'Retrieve paginated list of all coupons',
  })
  @ApiOkResponse({
    description: 'Coupons retrieved successfully',
    type: CouponPaginator,
  })
  @ApiQuery({ name: 'shop_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  getCoupons(@Query() query: GetCouponsDto): Promise<CouponPaginator> {
    return this.couponsService.getCoupons(query);
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get coupon by code or ID',
    description: 'Retrieve coupon details by code or ID (Public)',
  })
  @ApiParam({
    name: 'param',
    description: 'Coupon code or ID',
    example: '5OFF',
  })
  @ApiOkResponse({
    description: 'Coupon retrieved successfully',
    type: Coupon,
  })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  @ApiQuery({ name: 'language', required: false })
  getCoupon(
    @Param('param') param: string,
    @Query('language') language: string,
  ): Promise<Coupon> {
    return this.couponsService.getCoupon(param, language);
  }

  @Post('verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify coupon',
    description: 'Verify if a coupon code is valid (Public)',
  })
  @ApiOkResponse({
    description: 'Coupon verification result',
    type: VerifyCouponResponse,
  })
  @ApiBody({ type: VerifyCouponInput })
  verifyCoupon(@Body('code') code: string): Promise<VerifyCouponResponse> {
    return this.couponsService.verifyCoupon(code);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update coupon',
    description: 'Update coupon information by ID',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number })
  @ApiOkResponse({
    description: 'Coupon updated successfully',
    type: Coupon,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  @ApiBody({ type: UpdateCouponDto })
  updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete coupon',
    description: 'Permanently delete a coupon by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number })
  @ApiOkResponse({
    description: 'Coupon deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  deleteCoupon(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CoreMutationOutput> {
    return this.couponsService.remove(id);
  }
}

@ApiTags('🎫 Coupons - Approval')
@Controller('approve-coupon')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ApproveCouponController {
  constructor(private couponsService: CouponsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Approve coupon',
    description: 'Approve a coupon (Admin only)',
  })
  @ApiOkResponse({
    description: 'Coupon approved successfully',
    type: Coupon,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
      },
    },
  })
  async approveCoupon(@Body('id') id: number): Promise<Coupon> {
    return this.couponsService.approveCoupon(id);
  }
}

@ApiTags('🎫 Coupons - Approval')
@Controller('disapprove-coupon')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DisapproveCouponController {
  constructor(private couponsService: CouponsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Disapprove coupon',
    description: 'Disapprove a coupon (Admin only)',
  })
  @ApiOkResponse({
    description: 'Coupon disapproved successfully',
    type: Coupon,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
      },
    },
  })
  async disapproveCoupon(@Body('id') id: number): Promise<Coupon> {
    return this.couponsService.disapproveCoupon(id);
  }
}
