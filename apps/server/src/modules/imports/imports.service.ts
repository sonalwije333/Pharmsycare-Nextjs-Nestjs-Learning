import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ImportDto, ImportResponseDto } from './dto/create-import.dto';

@Injectable()
export class ImportsService {
  private importJobs = new Map<number, any>();

  async importAttributes(importDto: ImportDto): Promise<ImportResponseDto> {
    this.validateImportData(importDto);

    const jobId = Date.now();
    this.importJobs.set(jobId, {
      id: jobId,
      type: 'attributes',
      status: 'processing',
      shop_id: importDto.shop_id,
      created_at: new Date()
    });

    // Simulate async processing
    this.processImportJob(jobId, 'attributes', importDto);

    return {
      job_id: jobId.toString(),
      status: 'processing',
      message: 'Attribute import started successfully'
    };
  }

  async importProducts(importDto: ImportDto): Promise<ImportResponseDto> {
    this.validateImportData(importDto);

    const jobId = Date.now();
    this.importJobs.set(jobId, {
      id: jobId,
      type: 'products',
      status: 'processing',
      shop_id: importDto.shop_id,
      created_at: new Date()
    });

    // Simulate async processing
    this.processImportJob(jobId, 'products', importDto);

    return {
      job_id: jobId.toString(),
      status: 'processing',
      message: 'Product import started successfully'
    };
  }

  async importVariationOptions(importDto: ImportDto): Promise<ImportResponseDto> {
    this.validateImportData(importDto);

    const jobId = Date.now();
    this.importJobs.set(jobId, {
      id: jobId,
      type: 'variation_options',
      status: 'processing',
      shop_id: importDto.shop_id,
      created_at: new Date()
    });

    // Simulate async processing
    this.processImportJob(jobId, 'variation_options', importDto);

    return {
      job_id: jobId.toString(),
      status: 'processing',
      message: 'Variation options import started successfully'
    };
  }

  private validateImportData(importDto: ImportDto): void {
    if (!importDto.csv_data && !importDto.file_url) {
      throw new BadRequestException('Either csv_data or file_url must be provided');
    }

    if (importDto.csv_data && importDto.file_url) {
      throw new BadRequestException('Provide either csv_data or file_url, not both');
    }
  }

  private async processImportJob(jobId: number, type: string, importDto: ImportDto): Promise<void> {
    // Simulate processing delay
    setTimeout(() => {
      const job = this.importJobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.completed_at = new Date();
        this.importJobs.set(jobId, job);
      }
    }, 5000); // 5 seconds delay
  }

  findAll(shop_id?: number): any[] {
    let jobs = Array.from(this.importJobs.values());

    if (shop_id) {
      jobs = jobs.filter(job => job.shop_id === shop_id);
    }

    return jobs.sort((a, b) => b.created_at - a.created_at);
  }

  findOne(id: number): any {
    const job = this.importJobs.get(id);

    if (!job) {
      throw new NotFoundException(`Import job with ID ${id} not found`);
    }

    return job;
  }

  remove(id: number): string {
    const job = this.importJobs.get(id);

    if (!job) {
      throw new NotFoundException(`Import job with ID ${id} not found`);
    }

    this.importJobs.delete(id);
    return `Import job #${id} has been deleted`;
  }

  // Additional helper methods
  getImportStats(): { total: number; completed: number; processing: number; failed: number } {
    const jobs = Array.from(this.importJobs.values());

    return {
      total: jobs.length,
      completed: jobs.filter(job => job.status === 'completed').length,
      processing: jobs.filter(job => job.status === 'processing').length,
      failed: jobs.filter(job => job.status === 'failed').length,
    };
  }
}