// reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { AbusiveReportsController } from './abusive-reports.controller';
import { AbusiveReportService } from './abusive-reports.service';

@Module({
  controllers: [ReviewController, AbusiveReportsController],
  providers: [ReviewService, AbusiveReportService],
})
export class ReviewModule {}