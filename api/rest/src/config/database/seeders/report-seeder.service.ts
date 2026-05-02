// src/config/database/seeders/report-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../../reports/entities/report.entity';

@Injectable()
export class ReportSeederService {
  private readonly logger = new Logger(ReportSeederService.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  private getReportsData(): Partial<Report>[] {
    return [
      {
        user_id: 2,
        model_type: 'Marvel\\Database\\Models\\Review',
        model_id: 78,
        message: 'this is a abusive report',
        created_at: new Date('2022-07-25T05:27:17.000Z'),
        updated_at: new Date('2022-07-25T05:27:17.000Z'),
      },
      {
        user_id: 2,
        model_type: 'Marvel\\Database\\Models\\Review',
        model_id: 21,
        message: 'this is abusive reports',
        created_at: new Date('2022-07-26T02:38:16.000Z'),
        updated_at: new Date('2022-07-26T02:38:16.000Z'),
      },
      {
        user_id: 2,
        model_type: 'Marvel\\Database\\Models\\Review',
        model_id: 1,
        message: 'xvcgfdgdfg',
        created_at: new Date('2022-07-26T04:35:51.000Z'),
        updated_at: new Date('2022-07-26T04:35:51.000Z'),
      },
      {
        user_id: 3,
        model_type: 'Marvel\\Database\\Models\\Product',
        model_id: 15,
        message: 'This product listing contains inappropriate content',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 4,
        model_type: 'Marvel\\Database\\Models\\Review',
        model_id: 45,
        message: 'Fake review, this user never purchased this product',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2,
        model_type: 'Marvel\\Database\\Models\\Product',
        model_id: 32,
        message: 'Copyright infringement - using my images without permission',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 5,
        model_type: 'Marvel\\Database\\Models\\Shop',
        model_id: 3,
        message: 'This shop is selling counterfeit products',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting reports seeding...');
      
      const reports = this.getReportsData();
      
      for (const reportData of reports) {
        const existingReport = await this.reportRepository.findOne({
          where: {
            user_id: reportData.user_id,
            model_type: reportData.model_type,
            model_id: reportData.model_id,
            message: reportData.message,
          },
        });

        if (!existingReport) {
          const newReport = this.reportRepository.create(reportData);
          await this.reportRepository.save(newReport);
          this.logger.log(`Created report for ${reportData.model_type} ID ${reportData.model_id} by user ${reportData.user_id}`);
        } else {
          this.logger.log(`Report already exists for ${reportData.model_type} ID ${reportData.model_id}`);
        }
      }
      
      this.logger.log('Reports seeding completed');
    } catch (error) {
      this.logger.error('Error seeding reports:', error);
      throw error;
    }
  }

  async seedByModelType(modelType: string): Promise<void> {
    try {
      this.logger.log(`Seeding reports for model type: ${modelType}`);
      
      const reports = this.getReportsData().filter(r => r.model_type === modelType);
      
      for (const reportData of reports) {
        const existingReport = await this.reportRepository.findOne({
          where: {
            user_id: reportData.user_id,
            model_type: reportData.model_type,
            model_id: reportData.model_id,
          },
        });

        if (!existingReport) {
          const newReport = this.reportRepository.create(reportData);
          await this.reportRepository.save(newReport);
          this.logger.log(`Created report for ${reportData.model_type} ID ${reportData.model_id}`);
        }
      }
      
      this.logger.log(`Reports for model type ${modelType} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding reports for model type ${modelType}:`, error);
      throw error;
    }
  }

  async seedByUserId(userId: number): Promise<void> {
    try {
      this.logger.log(`Seeding reports for user ID: ${userId}`);
      
      const reports = this.getReportsData().filter(r => r.user_id === userId);
      
      for (const reportData of reports) {
        const existingReport = await this.reportRepository.findOne({
          where: {
            user_id: reportData.user_id,
            model_type: reportData.model_type,
            model_id: reportData.model_id,
          },
        });

        if (!existingReport) {
          const newReport = this.reportRepository.create(reportData);
          await this.reportRepository.save(newReport);
          this.logger.log(`Created report by user ${userId}`);
        }
      }
      
      this.logger.log(`Reports for user ID ${userId} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding reports for user ID ${userId}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing reports...');
      await this.reportRepository.clear();
      this.logger.log('Reports cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing reports:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    byModelType: Record<string, number>;
    uniqueUsers: number;
  }> {
    const reports = await this.reportRepository.find();
    
    const byModelType: Record<string, number> = {};
    const uniqueUsersSet = new Set<number>();
    
    for (const report of reports) {
      // Count by model type
      byModelType[report.model_type] = (byModelType[report.model_type] || 0) + 1;
      
      // Track unique users
      uniqueUsersSet.add(report.user_id);
    }
    
    return {
      total: reports.length,
      byModelType,
      uniqueUsers: uniqueUsersSet.size,
    };
  }
}