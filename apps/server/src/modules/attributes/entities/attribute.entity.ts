import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AttributeValue } from './attribute-value.entity';
import { Shop } from '../../shops/entites/shop.entity';

@Entity()
export class Attribute extends CoreEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'shop_id', nullable: true })
  shop_id?: string;

  @Column({ default: 'en' })
  language: string;

  @Column('simple-array', { nullable: true })
  translated_languages?: string[];

  @ManyToOne(() => Shop, { eager: true, nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop?: Shop;

  @OneToMany(() => AttributeValue, (value) => value.attribute, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  values: AttributeValue[];
}
