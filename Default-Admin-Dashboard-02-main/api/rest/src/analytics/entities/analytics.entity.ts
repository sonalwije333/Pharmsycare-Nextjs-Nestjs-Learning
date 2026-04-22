// analytics/entities/analytics.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  OrderByStatusDto,
  TotalYearSaleByMonthDto,
} from '../dto/analytics-response.dto';

@Entity('analytics')
export class Analytics extends CoreEntity {
  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRevenue?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRefunds?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  totalShops?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  totalVendors?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  todaysRevenue?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  totalOrders?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  newCustomers?: number;

  @ApiProperty({ type: OrderByStatusDto, required: false })
  @Column({ type: 'json', nullable: true })
  todayTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: OrderByStatusDto, required: false })
  @Column({ type: 'json', nullable: true })
  weeklyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: OrderByStatusDto, required: false })
  @Column({ type: 'json', nullable: true })
  monthlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: OrderByStatusDto, required: false })
  @Column({ type: 'json', nullable: true })
  yearlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: [TotalYearSaleByMonthDto], required: false })
  @Column({ type: 'json', nullable: true })
  totalYearSaleByMonth?: TotalYearSaleByMonthDto[];
}
