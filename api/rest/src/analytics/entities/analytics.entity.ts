import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { OrderByStatusDto, TotalYearSaleByMonthDto } from '../dto/analytics-response.dto';

@Entity('analytics')
export class Analytics extends CoreEntity {
  @ApiProperty({ required: false, type: Number, description: 'Total revenue', example: 1818.8 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRevenue?: number;

  @ApiProperty({ required: false, type: Number, description: 'Total refunds', example: 0 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRefunds?: number;

  @ApiProperty({ required: false, type: Number, description: 'Total shops', example: 14 })
  @Column({ type: 'int', nullable: true })
  totalShops?: number;

  @ApiProperty({ required: false, type: Number, description: 'Total vendors', example: 11 })
  @Column({ type: 'int', nullable: true })
  totalVendors?: number;

  @ApiProperty({ required: false, type: Number, description: "Today's revenue", example: 0 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  todaysRevenue?: number;

  @ApiProperty({ required: false, type: Number, description: 'Total orders', example: 14 })
  @Column({ type: 'int', nullable: true })
  totalOrders?: number;

  @ApiProperty({ required: false, type: Number, description: 'New customers', example: 10 })
  @Column({ type: 'int', nullable: true })
  newCustomers?: number;

  @ApiProperty({ type: () => OrderByStatusDto, required: false, description: "Today's orders by status" })
  @Column({ type: 'json', nullable: true })
  todayTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: () => OrderByStatusDto, required: false, description: 'Weekly orders by status' })
  @Column({ type: 'json', nullable: true })
  weeklyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: () => OrderByStatusDto, required: false, description: 'Monthly orders by status' })
  @Column({ type: 'json', nullable: true })
  monthlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: () => OrderByStatusDto, required: false, description: 'Yearly orders by status' })
  @Column({ type: 'json', nullable: true })
  yearlyTotalOrderByStatus?: OrderByStatusDto;

  @ApiProperty({ type: () => [TotalYearSaleByMonthDto], required: false, description: 'Total year sale by month' })
  @Column({ type: 'json', nullable: true })
  totalYearSaleByMonth?: TotalYearSaleByMonthDto[];

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}