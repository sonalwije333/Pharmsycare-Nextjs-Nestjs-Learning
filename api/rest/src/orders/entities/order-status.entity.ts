import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, DeleteDateColumn } from 'typeorm';

@Entity('order_statuses')
export class OrderStatus extends CoreEntity {
  @ApiProperty({ description: 'Status name', example: 'Order Received', type: String })
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @ApiProperty({ description: 'Status color', example: '#23b848', type: String })
  @Column({ type: 'varchar', nullable: true })
  color: string;

  @ApiProperty({ description: 'Serial number', example: 1, type: Number })
  @Column({ type: 'int', nullable: true })
  serial: number;

  @ApiProperty({ description: 'Status slug', example: 'order-received', type: String })
  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @ApiProperty({ description: 'Language', example: 'en', type: String })
  @Column({ type: 'varchar', nullable: true })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en'] })
  @Column({ type: 'simple-json', nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;
}