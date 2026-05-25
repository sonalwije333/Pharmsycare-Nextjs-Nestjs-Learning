// attributes/entities/attribute.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { AttributeValue } from './attribute-value.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity('attributes')
export class Attribute extends CoreEntity {
  @ApiProperty({
    description: 'Attribute name',
    example: 'Color',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Shop ID',
    example: '1',
  })
  @Column()
  shop_id: string;

  @ApiProperty({
    type: () => Shop,
    description: 'Shop details',
    required: false,
  })
  shop?: Shop;

  @ApiProperty({
    description: 'Attribute slug',
    example: 'color',
  })
  @Column()
  slug: string;

  @ApiProperty({
    type: [AttributeValue],
    description: 'Attribute values',
  })
  @OneToMany(() => AttributeValue, (value) => value.attribute, {
    cascade: true,
  })
  values: AttributeValue[];

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

  @ApiProperty({
    description: 'Type information (legacy field)',
    required: false,
  })
  @Column('json', { nullable: true })
  type?: {
    id: number | null;
    name: string | null;
    slug: string | null;
    logo: string | null;
  };
}
