import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { DeleteDateColumn } from 'typeorm';

export class NotifyLogs extends CoreEntity {
  @ApiProperty({ 
    description: 'Receiver of notification', 
    example: 'user@example.com',
    type: String,
  })
  receiver: string;

  @ApiProperty({ 
    description: 'Sender of notification', 
    example: 'system@example.com',
    type: String,
  })
  sender: string;

  @ApiProperty({ 
    description: 'Type of notification', 
    example: 'order_status',
    type: String,
  })
  notify_type: string;

  @ApiProperty({ 
    description: 'Receiver type', 
    example: 'customer',
    type: String,
  })
  notify_receiver_type: string;

  @ApiProperty({ 
    description: 'Read status', 
    example: false,
    type: Boolean,
  })
  is_read: boolean;

  @ApiProperty({ 
    description: 'Notification text content', 
    example: 'Your order has been shipped',
    type: String,
  })
  notify_text: string;

  @ApiProperty({ 
    description: 'Soft delete timestamp', 
    required: false,
    type: Date,
  })
  @DeleteDateColumn()
  deleted_at?: Date;
}