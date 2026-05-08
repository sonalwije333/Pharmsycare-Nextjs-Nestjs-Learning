import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import type { Attribute } from './attribute.entity';
import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';

@Entity('attribute_values')
export class AttributeValue extends CoreEntity {
  @ApiProperty({ description: 'Shop ID', example: 1, type: Number })
  @Column()
  shop_id: number;

  @ApiProperty({ description: 'Attribute value', example: 'Red', type: String })
  @Column()
  value: string;

  @ApiProperty({ description: 'Meta information (e.g., color code)', example: '#FF0000', required: false, type: String })
  @Column({ nullable: true })
  meta?: string;

  @ApiProperty({ description: 'Attribute value slug', example: 'red', required: false, type: String })
  @Column({ nullable: true })
  slug?: string;

  @ApiHideProperty()
  @ManyToOne(() => require('./attribute.entity').Attribute, (attribute: Attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @ApiProperty({ description: 'Attribute ID', example: 1, type: Number })
  @Column()
  attribute_id: number;

  @ApiProperty({ description: 'Language code', example: 'en', type: String, default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en', 'es', 'fr'] })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;
}
