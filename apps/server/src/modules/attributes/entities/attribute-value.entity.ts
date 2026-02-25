import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Attribute } from './attribute.entity';

@Entity('attribute_values')
export class AttributeValue extends CoreEntity {
  @Column()
  value: string;

  @Column({ nullable: true })
  meta?: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ name: 'attribute_id' })
  attribute_id: number;

  @ManyToOne(() => Attribute, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;
}
