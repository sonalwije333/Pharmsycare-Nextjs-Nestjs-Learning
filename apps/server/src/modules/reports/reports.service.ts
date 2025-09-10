import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetMyReportDto, MyReportPaginator } from './dto/get-reports.dto';
import { MyReports } from './entities/report.entity';
import { paginate } from '../common/pagination/paginate';

import { SortOrder } from "../common/dto/generic-conditions.dto";
import { JwtService } from '@nestjs/jwt';
import {QueryReportsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(MyReports)
        private readonly reportRepository: Repository<MyReports>,
        private readonly jwtService: JwtService,
    ) {}

    async create(createReportDto: CreateReportDto): Promise<MyReports> {
        const report = this.reportRepository.create({
            ...createReportDto,
            type: createReportDto.type || 'other',
            status: 'pending',
            priority: createReportDto.priority || 'medium',
            language: createReportDto.language || 'en',
            translated_languages: createReportDto.translated_languages || [],
        });

        return await this.reportRepository.save(report);
    }

    async findAllReports({
                             page = 1,
                             limit = 30,
                             search,
                             type,
                             status,
                             priority,
                             user_id,
                             language,
                             orderBy,
                             sortOrder = SortOrder.DESC
                         }: GetMyReportDto): Promise<MyReportPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.reportRepository.createQueryBuilder('report');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(report.message ILIKE :search OR report.title ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (type) {
            queryBuilder.andWhere('report.type = :type', { type });
        }

        if (status) {
            queryBuilder.andWhere('report.status = :status', { status });
        }

        if (priority) {
            queryBuilder.andWhere('report.priority = :priority', { priority });
        }

        if (user_id) {
            queryBuilder.andWhere('report.user_id = :user_id', { user_id });
        }

        if (language) {
            queryBuilder.andWhere('report.language = :language', { language });
        }

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`report.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('report.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/reports?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    async getMyReports({
                           page = 1,
                           limit = 30,
                           type,
                           status,
                           language,
                           orderBy,
                           sortOrder = SortOrder.DESC
                       }: GetMyReportDto, userId: string): Promise<MyReportPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.reportRepository.createQueryBuilder('report')
            .where('report.user_id = :userId', { userId });

        if (type) {
            queryBuilder.andWhere('report.type = :type', { type });
        }

        if (status) {
            queryBuilder.andWhere('report.status = :status', { status });
        }

        if (language) {
            queryBuilder.andWhere('report.language = :language', { language });
        }

        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`report.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('report.created_at', sortOrderString);
        }

        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/reports/my-reports?limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryReportsOrderByColumn): string {
        switch (orderBy) {
            case QueryReportsOrderByColumn.NAME:
                return 'title';
            case QueryReportsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryReportsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findOne(id: number): Promise<MyReports> {
        const report = await this.reportRepository.findOne({
            where: { id }
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        return report;
    }

    async updateStatus(id: number, status: string): Promise<MyReports> {
        const report = await this.reportRepository.findOneBy({ id });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            throw new NotFoundException(`Invalid status: ${status}`);
        }

        report.status = status;

        // Set resolved_at timestamp if status is resolved or closed
        if (status === 'resolved' || status === 'closed') {
            report.resolved_at = new Date();
        }

        return await this.reportRepository.save(report);
    }

    async update(id: number, updateReportDto: UpdateReportDto): Promise<MyReports> {
        const report = await this.reportRepository.findOneBy({ id });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        // Update fields
        Object.keys(updateReportDto).forEach(key => {
            if (updateReportDto[key] !== undefined) {
                report[key] = updateReportDto[key];
            }
        });

        return await this.reportRepository.save(report);
    }

    async remove(id: number): Promise<void> {
        const report = await this.reportRepository.findOneBy({ id });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        // Soft delete implementation
        report.deleted_at = new Date();
        await this.reportRepository.save(report);
    }
}