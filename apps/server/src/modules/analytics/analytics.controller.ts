import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './entities/analytics.entity';
import { CategoryWiseProduct } from './entities/category-wise-product.entity';
import { TopRateProduct } from './entities/top-rate-product.entity';
import { Product } from '../products/entities/product.entity';
import { GetAnalyticsDto } from './dto/get-analytics.dto';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get analytics data',
    description:
      'Retrieves comprehensive analytics data with optional filtering by period and date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    type: Analytics,
  })
  @ApiResponse({ status: 404, description: 'Analytics data not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  analytics(@Query() getAnalyticsDto?: GetAnalyticsDto) {
    return this.analyticsService.findAll(getAnalyticsDto);
  }
}

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/category-wise-product')
export class CategoryWiseProductController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get category-wise product analytics',
    description: 'Retrieves product analytics grouped by categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category-wise product data retrieved successfully',
    type: [CategoryWiseProduct],
  })
  @ApiResponse({
    status: 404,
    description: 'Category-wise product data not found',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  analytics() {
    return this.analyticsService.findAllCategoryWiseProduct();
  }
}

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/low-stock-products')
export class LowStockProductsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get low stock products',
    description:
      'Retrieves products with low stock levels. Optional threshold parameter.',
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Stock threshold (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved successfully',
    type: [Product],
  })
  @ApiResponse({ status: 404, description: 'No low stock products found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  analytics(
    @Query('threshold', new DefaultValuePipe(10), ParseIntPipe)
    threshold: number,
  ) {
    return this.analyticsService.findAllLowStockProducts(threshold);
  }
}

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/top-rate-product')
export class TopRateProductController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get top-rated products',
    description:
      'Retrieves top-rated products based on ratings and review count.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top-rated products retrieved successfully',
    type: [TopRateProduct],
  })
  @ApiResponse({ status: 404, description: 'No top-rated products found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  analytics(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.findAllTopRateProduct(limit);
  }
}
