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
import { Permission, SortOrder } from '../common/enums/enums';
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
    type: () => Coupon,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateCouponDto })
  create(@Body() createCouponDto: CreateCouponDto): Promise<Coupon> {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all coupons',
    description: 'Retrieve paginated list of all coupons',
  })
  @ApiOkResponse({
    description: 'Coupons retrieved successfully',
    type: CouponPaginator,
  })
  findAll(@Query() query: GetCouponsDto): Promise<CouponPaginator> {
    return this.couponsService.findAll(query);
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
    type: String,
  })
  @ApiOkResponse({
    description: 'Coupon retrieved successfully',
    type: () => Coupon,
  })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  findOne(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<Coupon> {
    return this.couponsService.findOne(param, language);
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
  verify(@Body('code') code: string): Promise<VerifyCouponResponse> {
    return this.couponsService.verify(code);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update coupon',
    description: 'Update coupon information by ID',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Coupon updated successfully',
    type: () => Coupon,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  @ApiBody({ type: UpdateCouponDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete coupon',
    description: 'Soft delete a coupon by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Coupon deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.couponsService.remove(id);
  }
}

@ApiTags('🎫 Coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ApproveCouponController {
  constructor(private couponsService: CouponsService) {}

  @Post('approve/:id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Approve coupon',
    description: 'Approve a coupon (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Coupon approved successfully',
    type: () => Coupon,
  })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  async approve(@Param('id', ParseIntPipe) id: number): Promise<Coupon> {
    return this.couponsService.approve(id);
  }

  @Post('disapprove/:id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Disapprove coupon',
    description: 'Disapprove a coupon (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Coupon disapproved successfully',
    type: () => Coupon,
  })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  async disapprove(@Param('id', ParseIntPipe) id: number): Promise<Coupon> {
    return this.couponsService.disapprove(id);
  }
}