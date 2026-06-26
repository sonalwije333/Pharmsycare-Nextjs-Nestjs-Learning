import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum SupportTicketCategory {
  GENERAL = 'general',
  PRESCRIPTION = 'prescription',
  ORDER = 'order',
  DELIVERY = 'delivery',
  BILLING = 'billing',
  OTHER = 'other',
}

export enum SupportTicketChannel {
  WEB = 'web',
  WHATSAPP = 'whatsapp',
}

export interface SupportTicketResponse {
  message: string;
  responder: string;
  responder_role?: string;
  created_at: string;
}

@Entity('support_tickets')
export class SupportTicket {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false })
  @Index()
  @Column({ nullable: true })
  customer_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  phone: string | null;

  @ApiProperty()
  @Column()
  subject: string;

  @ApiProperty({ enum: SupportTicketCategory })
  @Column({
    type: 'enum',
    enum: SupportTicketCategory,
    default: SupportTicketCategory.GENERAL,
  })
  category: SupportTicketCategory;

  @ApiProperty()
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ enum: SupportTicketChannel })
  @Column({
    type: 'enum',
    enum: SupportTicketChannel,
    default: SupportTicketChannel.WEB,
  })
  channel: SupportTicketChannel;

  @ApiProperty({ enum: SupportTicketStatus })
  @Index()
  @Column({
    type: 'enum',
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  status: SupportTicketStatus;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  order_id: number | null;

  @ApiProperty({ required: false, type: 'array' })
  @Column({ type: 'simple-json', nullable: true })
  responses: SupportTicketResponse[];

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
