// taxes/entities/tax.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity('taxes')
export class Tax extends CoreEntity {
  @ApiProperty({ description: 'Tax ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tax name', example: 'VAT' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Tax rate (percentage)', example: 10 })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number;

  @ApiProperty({ description: 'Is this a global tax', example: true })
  @Column({ default: false })
  is_global: boolean;

  @ApiProperty({ description: 'Country for tax (if not global)', required: false })
  @Column({ nullable: true })
  country?: string | null;

  @ApiProperty({ description: 'State for tax (if not global)', required: false })
  @Column({ nullable: true })
  state?: string | null;

  @ApiProperty({ description: 'ZIP code for tax (if not global)', required: false })
  @Column({ nullable: true })
  zip?: string | null;

  @ApiProperty({ description: 'City for tax (if not global)', required: false })
  @Column({ nullable: true })
  city?: string | null;

  @ApiProperty({ description: 'Priority (for multiple taxes)', required: false })
  @Column({ nullable: true })
  priority?: number | null;

  @ApiProperty({ description: 'Apply tax on shipping', example: true })
  @Column({ default: false })
  on_shipping: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}