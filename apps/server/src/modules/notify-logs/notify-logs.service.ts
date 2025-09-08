import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GetNotifyLogsDto, NotifyLogsPaginator } from './dto/get-notify-logs.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { NotifyLogs } from './entities/notify-logs.entity';
import { paginate } from '../common/pagination/paginate';

import { SortOrder } from "../common/dto/generic-conditions.dto";
import {QueryNotifyLogsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class NotifyLogsService {
    constructor(
        @InjectRepository(NotifyLogs)
        private readonly notifyLogsRepository: Repository<NotifyLogs>,
    ) {}

    async findAllNotifyLogs({
                                page = 1,
                                limit = 30,
                                search,
                                receiver,
                                notify_type,
                                is_read,
                                orderBy,
                                sortOrder = SortOrder.DESC
                            }: GetNotifyLogsDto): Promise<NotifyLogsPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.notifyLogsRepository.createQueryBuilder('notify_logs');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(notify_logs.notify_text ILIKE :search OR notify_logs.notify_type ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (receiver) {
            queryBuilder.andWhere('notify_logs.receiver = :receiver', { receiver });
        }

        if (notify_type) {
            queryBuilder.andWhere('notify_logs.notify_type = :notify_type', { notify_type });
        }

        if (is_read !== undefined) {
            queryBuilder.andWhere('notify_logs.is_read = :is_read', { is_read });
        }

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`notify_logs.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('notify_logs.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/notify-logs?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryNotifyLogsOrderByColumn): string {
        switch (orderBy) {
            case QueryNotifyLogsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryNotifyLogsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getNotifyLog(param: string): Promise<NotifyLogs> {
        const notifyLog = await this.notifyLogsRepository.findOne({
            where: { id: Number(param) }
        });

        if (!notifyLog) {
            throw new NotFoundException(`Notification with ID ${param} not found`);
        }

        return notifyLog;
    }

    async markAsRead(markAsReadDto: MarkAsReadDto): Promise<void> {
        const { ids, receiver } = markAsReadDto;

        if (!ids && !receiver) {
            throw new BadRequestException('Either ids or receiver must be provided');
        }

        if (ids && ids.length > 0) {
            // Mark specific notifications as read
            await this.notifyLogsRepository.update(
                { id: In(ids) },
                { is_read: true, updated_at: new Date() }
            );
        } else if (receiver) {
            // Mark all notifications for receiver as read
            await this.notifyLogsRepository.update(
                { receiver, is_read: false },
                { is_read: true, updated_at: new Date() }
            );
        }
    }

    async remove(id: number): Promise<void> {
        const notifyLog = await this.notifyLogsRepository.findOneBy({ id });

        if (!notifyLog) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        // Soft delete implementation
        notifyLog.deleted_at = new Date();
        await this.notifyLogsRepository.save(notifyLog);
    }
}