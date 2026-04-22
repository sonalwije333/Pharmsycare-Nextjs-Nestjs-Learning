// refunds/reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import reportJSON from '@db/reports.json';
import { plainToClass } from 'class-transformer';
import { GetReportDto } from 'src/reports/dto/get-reports.dto';
import { Report } from 'src/reports/entities/report.entity';

@Injectable()
export class AbusiveReportService {
  private reports: Report[] = plainToClass(Report, reportJSON);

  async findAllReports(query: GetReportDto): Promise<Report[]> {
    let data = [...this.reports];
    
    // Filter by model_id if provided
    if (query.model_id !== undefined) {
      data = data.filter(report => report.model_id === query.model_id);
    }
    
    return data;
  }

  async findReport(id: number): Promise<Report> {
    const report = this.reports.find(r => r.id === id);
    
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    
    return report;
  }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const newReport: Report = {
      id: this.reports.length + 1,
      user_id: createReportDto.user_id,
      model_id: createReportDto.model_id,
      model_type: createReportDto.model_type,
      message: createReportDto.message,
      created_at: new Date(),
      updated_at: new Date(),
    } as Report;

    this.reports.push(newReport);
    return newReport;
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    const updatedReport = {
      ...this.reports[reportIndex],
      ...updateReportDto,
      updated_at: new Date()
    };

    this.reports[reportIndex] = updatedReport as Report;
    return updatedReport as Report;
  }

  async delete(id: number): Promise<CoreMutationOutput> {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    this.reports.splice(reportIndex, 1);
    
    return {
      success: true,
      message: 'Report deleted successfully'
    };
  }
}