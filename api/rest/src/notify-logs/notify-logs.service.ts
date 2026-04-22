// notify-logs/notify-logs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotifyLogs } from './entities/notify-logs.entity';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { GetNotifyLogsDto, NotifyLogsPaginator, QueryReviewsOrderByColumn } from './dto/get-notify-logs.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';

const notifyLogs = plainToClass(NotifyLogs, []);
const options = {
  keys: ['notify_type', 'notify_text'],
  threshold: 0.3,
};
const fuse = new Fuse(notifyLogs, options);

@Injectable()
export class NotifyLogsService {
  private notifyLogs: NotifyLogs[] = notifyLogs;

  findAllNotifyLogs({ search, limit, page, receiver, orderBy = QueryReviewsOrderByColumn.CREATED_AT, sortedBy = SortOrder.DESC }: GetNotifyLogsDto): NotifyLogsPaginator {
    if (!page) page = 1;
    if (!limit) limit = 10;
    
    let data: NotifyLogs[] = [...this.notifyLogs];

    if (receiver) {
      data = data.filter(log => log.receiver === receiver.toString());
    }

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'notify_type' && value) {
          data = fuse.search(value)?.map(({ item }) => item);
        } else if (key === 'is_read' && value) {
          data = data.filter(log => log.is_read === (value === 'true'));
        } else {
          data = data.filter(log => 
            log.notify_type?.toLowerCase().includes(search.toLowerCase()) ||
            log.notify_text?.toLowerCase().includes(search.toLowerCase())
          );
        }
      }
    }

    const sortKey = orderBy === QueryReviewsOrderByColumn.CREATED_AT ? 'created_at' : 'updated_at';
    data.sort((a, b) => {
      const aValue = a[sortKey as keyof NotifyLogs];
      const bValue = b[sortKey as keyof NotifyLogs];
      if (sortedBy === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/notify-logs?search=${search}&limit=${limit}`;
    
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getNotifyLog(param: string, language: string): NotifyLogs {
    const notifyLog = this.notifyLogs.find((p) => p.id === Number(param));
    
    if (!notifyLog) {
      throw new NotFoundException(`Notify log with ID ${param} not found`);
    }
    
    return notifyLog;
  }

  readNotifyLog(id: number): NotifyLogs {
    const notifyLog = this.notifyLogs.find((p) => p.id === id);
    
    if (!notifyLog) {
      throw new NotFoundException(`Notify log with ID ${id} not found`);
    }
    
    notifyLog.is_read = true;
    return notifyLog;
  }

  readAllNotifyLogs(userId: number): CoreMutationOutput {
    const userLogs = this.notifyLogs.filter(log => log.receiver === userId.toString());
    
    if (userLogs.length === 0) {
      throw new NotFoundException(`No notify logs found for user ${userId}`);
    }
    
    userLogs.forEach(log => {
      log.is_read = true;
    });
    
    return {
      success: true,
      message: `Marked ${userLogs.length} notifications as read`,
    };
  }

  remove(id: number): CoreMutationOutput {
    const index = this.notifyLogs.findIndex(log => log.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Notify log with ID ${id} not found`);
    }
    
    this.notifyLogs.splice(index, 1);
    
    return {
      success: true,
      message: 'Notify log deleted successfully',
    };
  }
}