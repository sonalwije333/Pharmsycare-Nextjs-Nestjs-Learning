import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GoodsReceivedNote } from './goods-received-note.entity';

@Entity('goods_received_note_items')
export class GrnItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Index()
  @Column()
  grn_id: number;

  @ManyToOne(() => GoodsReceivedNote, (grn) => grn.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'grn_id' })
  grn: GoodsReceivedNote;

  @ApiProperty()
  @Column()
  product_id: number;

  @ApiProperty()
  @Column()
  product_name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  sku: string | null;

  @ApiProperty()
  @Column({ default: 0 })
  ordered_quantity: number;

  @ApiProperty()
  @Column({ default: 0 })
  received_quantity: number;

  @ApiProperty({ required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unit_cost: number | null;

  @ApiProperty({ required: false })
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  total_cost: number | null;
}
