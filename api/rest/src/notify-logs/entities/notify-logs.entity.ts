// notify-logs/entities/notify-logs.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';

export class NotifyLogs extends CoreEntity {
  @ApiProperty({ description: 'Receiver of notification', example: 'user@example.com' })
  receiver: string;

  @ApiProperty({ description: 'Sender of notification', example: 'system@example.com' })
  sender: string;

  @ApiProperty({ description: 'Type of notification', example: 'order_status' })
  notify_type: string;

  @ApiProperty({ description: 'Receiver type', example: 'customer' })
  notify_receiver_type: string;

  @ApiProperty({ description: 'Read status', example: false })
  is_read: boolean;

  @ApiProperty({ description: 'Notification text content', example: 'Your order has been shipped' })
  notify_text: string;
}