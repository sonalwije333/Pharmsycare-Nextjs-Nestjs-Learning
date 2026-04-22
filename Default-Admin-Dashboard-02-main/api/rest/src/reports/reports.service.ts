// reports/reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportDto, ReportPaginator } from './dto/get-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import reportJSON from '@db/reports.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ReportsService {
  private reports: Report[] = plainToClass(Report, reportJSON);

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const newReport: Report = {
      id: this.reports.length + 1,
      user_id: createReportDto.user_id,
      model_type: createReportDto.model_type,
      model_id: createReportDto.model_id,
      message: createReportDto.message,
      created_at: new Date(),
      updated_at: new Date(),
    } as Report;

    this.reports.push(newReport);
    return newReport;
  }

  async findAll({
    search,
    limit = 10,
    page = 1,
    model_type,
    user_id,
    model_id,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetReportDto): Promise<ReportPaginator> {
    let data: Report[] = [...this.reports];

    // Apply filters
    if (model_type) {
      data = data.filter(report => report.model_type === model_type);
    }

    if (user_id) {
      data = data.filter(report => report.user_id === user_id);
    }

    if (model_id) {
      data = data.filter(report => report.model_id === model_id);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(report => 
        report.message.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'model_type':
          aValue = a.model_type;
          bValue = b.model_type;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (orderBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/reports?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<Report> {
    const report = this.reports.find(r => r.id === id);
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    
    return report;
  }

  async findByUser(userId: number, query: GetReportDto): Promise<ReportPaginator> {
    return this.findAll({ ...query, user_id: userId });
  }

  async findByModel(modelType: string, modelId: number, query: GetReportDto): Promise<ReportPaginator> {
    return this.findAll({ ...query, model_type: modelType, model_id: modelId });
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      throw new NotFoundException('Report not found');
    }

    const updatedReport = {
      ...this.reports[reportIndex],
      ...updateReportDto,
      updated_at: new Date()
    };

    this.reports[reportIndex] = updatedReport as Report;
    return updatedReport as Report;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      throw new NotFoundException('Report not found');
    }

    this.reports.splice(reportIndex, 1);
    
    return {
      success: true,
      message: 'Report deleted successfully'
    };
  }
}