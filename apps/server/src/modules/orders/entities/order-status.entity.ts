import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class OrderStatus extends CoreEntity {
  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  serial: number;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 'en' })
  language?: string;

  @Column({ type: 'json', nullable: true })
  translated_languages?: string[];
}