// analytics/dto/analytics-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TotalYearSaleByMonthDto {
  @ApiProperty({
    description: 'Total sales for the month',
    example: 4,
    required: false,
  })
  total?: number;

  @ApiProperty({
    description: 'Month name',
    example: 'January',
    required: false,
  })
  month?: string;
}

export class OrderByStatusDto {
  @ApiProperty({ example: 0, required: false })
  pending?: number;

  @ApiProperty({ example: 0, required: false })
  processing?: number;

  @ApiProperty({ example: 0, required: false })
  complete?: number;

  @ApiProperty({ example: 0, required: false })
  cancelled?: number;

  @ApiProperty({ example: 0, required: false })
  refunded?: number;

  @ApiProperty({ example: 0, required: false })
  failed?: number;

  @ApiProperty({ example: 0, required: false })
  localFacility?: number;

  @ApiProperty({ example: 0, required: false })
  outForDelivery?: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({
    description: 'Total revenue',
    example: 1818.8,
    required: false,
  })
  totalRevenue?: number;

  @ApiProperty({
    description: 'Total refunds',
    example: 0,
    required: false,
  })
  totalRefunds?: number;

  @ApiProperty({
    description: 'Total shops',
    example: 14,
    required: false,
  })
  totalShops?: number;

  @ApiProperty({
    description: 'Total vendors',
    example: 11,
    required: false,
  })
  totalVendors?: number;

  @ApiProperty({
    description: "Today's revenue",
    example: 0,
    required: false,
  })
  todaysRevenue?: number;

  @ApiProperty({
    description: 'Total orders',
    example: 14,
    required: false,
  })
  totalOrders?: number;

  @ApiProperty({
    description: 'New customers',
    example: 10,
    required: false,
  })
  newCustomers?: number;

  @ApiProperty({
    description: "Today's orders by status",
    type: OrderByStatusDto,
    required: false,
  })
  todayTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Weekly orders by status',
    type: OrderByStatusDto,
    required: false,
  })
  weeklyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Monthly orders by status',
    type: OrderByStatusDto,
    required: false,
  })
  monthlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Yearly orders by status',
    type: OrderByStatusDto,
    required: false,
  })
  yearlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Total year sale by month',
    type: [TotalYearSaleByMonthDto],
    required: false,
  })
  totalYearSaleByMonth?: TotalYearSaleByMonthDto[];
}
