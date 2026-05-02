import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';
import { Column, Entity } from 'typeorm';

@Entity('tags')
export class Tag extends CoreEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  parent: number;

  @Column('text', { nullable: true })
  details: string;

  @Column('json', { nullable: true })
  image: Attachment;

  @Column({ nullable: true })
  icon: string;

  @Column('json', { nullable: true })
  type: Type;

  @Column('json', { nullable: true })
  products: Product[];

  @Column({ default: 'en' })
  language: string;

  @Column('simple-array', { nullable: true })
  translated_languages: string[];
}
