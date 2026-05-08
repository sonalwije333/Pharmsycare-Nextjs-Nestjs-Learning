import { ApiProperty } from '@nestjs/swagger';


export class TotalYearSaleByMonthDto {
  @ApiProperty({
    description: 'Total sales for the month',
    example: 4,
    required: false,
    type: Number,
  })
  total?: number;

  @ApiProperty({
    description: 'Month name',
    example: 'January',
    required: false,
    type: String,
  })
  month?: string;
}

export class OrderByStatusDto {
  @ApiProperty({ example: 0, required: false, type: Number, description: 'Pending orders count' })
  pending?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Processing orders count' })
  processing?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Complete orders count' })
  complete?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Cancelled orders count' })
  cancelled?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Refunded orders count' })
  refunded?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Failed orders count' })
  failed?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Local facility orders count' })
  localFacility?: number;

  @ApiProperty({ example: 0, required: false, type: Number, description: 'Out for delivery orders count' })
  outForDelivery?: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({
    description: 'Total revenue',
    example: 1818.8,
    required: false,
    type: Number,
  })
  totalRevenue?: number;

  @ApiProperty({
    description: 'Total refunds',
    example: 0,
    required: false,
    type: Number,
  })
  totalRefunds?: number;

  @ApiProperty({
    description: 'Total shops',
    example: 14,
    required: false,
    type: Number,
  })
  totalShops?: number;

  @ApiProperty({
    description: 'Total vendors',
    example: 11,
    required: false,
    type: Number,
  })
  totalVendors?: number;

  @ApiProperty({
    description: "Today's revenue",
    example: 0,
    required: false,
    type: Number,
  })
  todaysRevenue?: number;

  @ApiProperty({
    description: 'Total orders',
    example: 14,
    required: false,
    type: Number,
  })
  totalOrders?: number;

  @ApiProperty({
    description: 'New customers',
    example: 10,
    required: false,
    type: Number,
  })
  newCustomers?: number;

  @ApiProperty({
    description: "Today's orders by status",
    type: () => OrderByStatusDto,
    required: false,
  })
  todayTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Weekly orders by status',
    type: () => OrderByStatusDto,
    required: false,
  })
  weeklyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Monthly orders by status',
    type: () => OrderByStatusDto,
    required: false,
  })
  monthlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Yearly orders by status',
    type: () => OrderByStatusDto,
    required: false,
  })
  yearlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({
    description: 'Total year sale by month',
    type: () => [TotalYearSaleByMonthDto],
    required: false,
  })
  totalYearSaleByMonth?: TotalYearSaleByMonthDto[];
}