// analytics/analytics.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResponseDto } from './dto/analytics-response.dto';
import { CategoryWiseProductResponseDto } from './dto/category-wise-product-response.dto';
import { TopRateProductResponseDto } from './dto/top-rate-product-response.dto';
import { Product } from 'src/products/entities/product.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('📊 Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get analytics overview',
    description:
      'Retrieve comprehensive analytics including revenue, orders, and statistics (Admin/Store Owner only)',
  })
  @ApiOkResponse({
    description: 'Analytics retrieved successfully',
    type: AnalyticsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  analytics(): Promise<AnalyticsResponseDto> {
    return this.analyticsService.findAll();
  }
}

@ApiTags('📊 Analytics - Category Wise Products')
@Controller('category-wise-product')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CategoryWiseProductController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get category wise products',
    description:
      'Retrieve product statistics grouped by category (Admin/Store Owner only)',
  })
  @ApiOkResponse({
    description: 'Category wise products retrieved successfully',
    type: [CategoryWiseProductResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  categoryWiseProduct(): Promise<CategoryWiseProductResponseDto[]> {
    return this.analyticsService.findAllCategoryWiseProduct();
  }
}

@ApiTags('📊 Analytics - Low Stock Products')
@Controller('low-stock-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LowStockProductsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get low stock products',
    description:
      'Retrieve products with low inventory levels (Admin/Store Owner only)',
  })
  @ApiOkResponse({
    description: 'Low stock products retrieved successfully',
    type: [Product],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  lowStockProducts(): Promise<Product[]> {
    return this.analyticsService.findAllLowStockProducts();
  }
}

@ApiTags('📊 Analytics - Top Rate Products')
@Controller('top-rate-product')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TopRateProductController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get top rated products',
    description:
      'Retrieve products with highest ratings (Admin/Store Owner only)',
  })
  @ApiOkResponse({
    description: 'Top rated products retrieved successfully',
    type: [TopRateProductResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  topRateProduct(): Promise<TopRateProductResponseDto[]> {
    return this.analyticsService.findAllTopRateProduct();
  }
}
