// terms-and-conditions/entities/terms-and-conditions.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';


@Entity('terms_and_conditions')
export class TermsAndConditions extends CoreEntity {
  @ApiProperty({ description: 'Terms ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en', 'es', 'fr'] })
  @Column('simple-array')
  translated_languages: string[];

  @ApiProperty({ description: 'Language', example: 'en', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Terms title', example: 'Acceptance of Terms' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Terms slug', example: 'acceptance-of-terms' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: 'Terms description/content', example: 'By using this Website, you agree...' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Associated shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: string;

  @ApiProperty({ description: 'Terms type', example: 'global', required: false })
  @Column({ nullable: true })
  type?: string;

  @ApiProperty({ description: 'Issued by', example: 'Super Admin', required: false })
  @Column({ nullable: true })
  issued_by?: string;

  @ApiProperty({ description: 'User ID who created', required: false })
  @Column({ nullable: true })
  user_id: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ nullable: true })
  deleted_at?: string;

  @ApiProperty({ description: 'Is approved', default: false })
  @Column({ default: false })
  is_approved?: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}