import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotifyLogs } from './entities/notify-logs.entity';
import { GetNotifyLogsDto, NotifyLogsPaginator } from './dto/get-notify-logs.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { NotifyLogsOrderByColumn } from 'src/common/enums/notify-logs-order-by.enum';


@Injectable()
export class NotifyLogsService {
  private notifyLogs: NotifyLogs[] = [];

  async findAll({
    page = 1,
    limit = 30,
    search,
    receiver,
    is_read,
    orderBy = NotifyLogsOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetNotifyLogsDto): Promise<NotifyLogsPaginator> {
    let data: NotifyLogs[] = [...this.notifyLogs];

    if (receiver) {
      data = data.filter(log => log.receiver === receiver.toString());
    }

    if (is_read !== undefined) {
      data = data.filter(log => log.is_read === is_read);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(log => 
        log.notify_type?.toLowerCase().includes(searchLower) ||
        log.notify_text?.toLowerCase().includes(searchLower) ||
        log.receiver?.toLowerCase().includes(searchLower)
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case NotifyLogsOrderByColumn.UPDATED_AT:
        orderColumn = 'updated_at';
        break;
      default:
        orderColumn = 'created_at';
    }

    data.sort((a, b) => {
      const aValue = a[orderColumn as keyof NotifyLogs];
      const bValue = b[orderColumn as keyof NotifyLogs];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortedBy === SortOrder.ASC ? -1 : 1;
      if (bValue === undefined) return sortedBy === SortOrder.ASC ? 1 : -1;

      if (sortedBy === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/notify-logs?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findOne(id: number): Promise<NotifyLogs> {
    const notifyLog = this.notifyLogs.find((p) => p.id === id);
    
    if (!notifyLog) {
      throw new NotFoundException(`Notify log with ID ${id} not found`);
    }
    
    return notifyLog;
  }

  async markAsRead(id: number): Promise<NotifyLogs> {
    const notifyLog = await this.findOne(id);
    
    notifyLog.is_read = true;
    
    const index = this.notifyLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      this.notifyLogs[index] = notifyLog;
    }
    
    return notifyLog;
  }

  async markAllAsRead(userId: number): Promise<CoreMutationOutput> {
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

  async remove(id: number): Promise<CoreMutationOutput> {
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

  // Helper method to create a new notification log
  async createNotifyLog(notifyData: Partial<NotifyLogs>): Promise<NotifyLogs> {
    const newNotifyLog: NotifyLogs = {
      id: this.notifyLogs.length + 1,
      receiver: notifyData.receiver || '',
      sender: notifyData.sender || 'system',
      notify_type: notifyData.notify_type || '',
      notify_receiver_type: notifyData.notify_receiver_type || 'customer',
      is_read: false,
      notify_text: notifyData.notify_text || '',
      created_at: new Date(),
      updated_at: new Date(),
    } as NotifyLogs;
    
    this.notifyLogs.unshift(newNotifyLog);
    
    return newNotifyLog;
  }

  // Helper method to get unread count for a user
  async getUnreadCount(receiverId: string): Promise<number> {
    return this.notifyLogs.filter(log => 
      log.receiver === receiverId && !log.is_read
    ).length;
  }
}