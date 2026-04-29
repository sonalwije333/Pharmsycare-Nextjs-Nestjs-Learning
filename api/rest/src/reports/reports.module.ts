// reports/reports.module.ts
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { MyReportsController } from './my-reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController, MyReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}