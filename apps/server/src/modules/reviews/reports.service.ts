import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../users/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";
import { Report } from './entities/reports.entity';

@Injectable()
export class AbusiveReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAllReports(): Promise<{ data: Report[] }> {
        const reports = await this.reportRepository.find({
            relations: ['user'],
            order: { created_at: 'DESC' } // Use the actual database column name
        });

        return {
            data: reports,
        };
    }

    async findReport(id: number): Promise<Report> {
        const report = await this.reportRepository.findOne({
            where: { id: id }, // Use proper syntax
            relations: ['user']
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        return report;
    }

    async create(createReportDto: CreateReportDto): Promise<Report> {
        let user: User | undefined = undefined;

        if (createReportDto.user_id) {
            const foundUser = await this.userRepository.findOne({
                where: { id: createReportDto.user_id }
            });

            if (!foundUser) {
                throw new NotFoundException(`User with ID ${createReportDto.user_id} not found`);
            }
            user = foundUser;
        }

        const reportData: Partial<Report> = {
            modelId: createReportDto.model_id,
            modelType: createReportDto.model_type,
            message: createReportDto.message,
            language: createReportDto.language || 'en',
            translatedLanguages: createReportDto.translated_languages || [],
        };

        const report = this.reportRepository.create(reportData);

        if (user) {
            report.user = user;
            report.userId = user.id;
        }

        return await this.reportRepository.save(report);
    }

    async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
        const report = await this.reportRepository.findOne({
            where: { id: id },
            relations: ['user']
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        if (updateReportDto.user_id && updateReportDto.user_id !== report.userId) {
            const user = await this.userRepository.findOne({
                where: { id: updateReportDto.user_id }
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${updateReportDto.user_id} not found`);
            }
            report.user = user;
            report.userId = user.id;
        }

        if (updateReportDto.model_id !== undefined) {
            report.modelId = updateReportDto.model_id;
        }
        if (updateReportDto.model_type !== undefined) {
            report.modelType = updateReportDto.model_type;
        }
        if (updateReportDto.message !== undefined) {
            report.message = updateReportDto.message;
        }
        if (updateReportDto.language !== undefined) {
            report.language = updateReportDto.language;
        }
        if (updateReportDto.translated_languages !== undefined) {
            report.translatedLanguages = updateReportDto.translated_languages;
        }

        return await this.reportRepository.save(report);
    }

    async delete(id: number): Promise<void> {
        const report = await this.reportRepository.findOne({
            where: { id: id }
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        report.deletedAt = new Date();
        await this.reportRepository.save(report);
    }
}