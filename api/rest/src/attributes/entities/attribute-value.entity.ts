// attributes/entities/attribute-value.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attribute } from './attribute.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('attribute_values')
export class AttributeValue extends CoreEntity {
  @ApiProperty({
    description: 'Shop ID',
    example: 1,
  })
  @Column()
  shop_id: number;

  @ApiProperty({
    description: 'Attribute value',
    example: 'Red',
  })
  @Column()
  value: string;

  @ApiProperty({
    description: 'Meta information (e.g., color code)',
    example: '#FF0000',
    required: false,
  })
  @Column({ nullable: true })
  meta?: string;

  @ApiProperty({
    description: 'Attribute value slug (legacy field)',
    example: 'red',
    required: false,
  })
  @Column({ nullable: true })
  slug?: string;

  @ApiProperty({
    type: () => Attribute,
    description: 'Parent attribute',
  })
  @ManyToOne(() => Attribute, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @ApiProperty({
    description: 'Attribute ID',
    example: 1,
  })
  @Column()
  attribute_id: number;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
  })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({
    description: 'Translated languages',
    example: ['en', 'es'],
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];
}
