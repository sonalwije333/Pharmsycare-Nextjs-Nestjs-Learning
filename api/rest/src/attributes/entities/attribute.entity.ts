import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import type { AttributeValue } from './attribute-value.entity';
import { Entity, Column, OneToMany, DeleteDateColumn } from 'typeorm';

@Entity('attributes')
export class Attribute extends CoreEntity {
  @ApiProperty({ description: 'Attribute name', example: 'Color', type: String })
  @Column()
  name: string;

  @ApiProperty({ description: 'Shop ID', example: '1', type: String })
  @Column()
  shop_id: string;

  @ApiProperty({ description: 'Attribute slug', example: 'color', type: String })
  @Column()
  slug: string;

  @ApiProperty({ type: () => [require('./attribute-value.entity').AttributeValue], description: 'Attribute values' })
  @OneToMany(() => require('./attribute-value.entity').AttributeValue, (value: AttributeValue) => value.attribute, {
    cascade: true,
  })
  values: AttributeValue[];

  @ApiProperty({ description: 'Language code', example: 'en', type: String, default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en', 'es', 'fr'] })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Type information (legacy field)', required: false, type: Object })
  @Column('json', { nullable: true })
  type?: {
    id: number | null;
    name: string | null;
    slug: string | null;
    logo: string | null;
  };

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;
}
