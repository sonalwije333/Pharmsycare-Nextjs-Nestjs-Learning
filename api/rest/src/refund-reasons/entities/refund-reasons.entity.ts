// refund-reasons/entities/refund-reasons.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity('refund_reasons')
export class RefundReason extends CoreEntity {
  @ApiProperty({ description: 'Refund reason ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Reason name', example: 'Product Not as Described' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Reason slug for URL', example: 'product-not-as-described' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: 'Language code', example: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({
    description: 'Translated languages',
    type: [String],
    example: ['en', 'es', 'fr']
  })
  @Column('simple-array')
  translated_languages: Array<string>;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ nullable: true })
  deleted_at?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}