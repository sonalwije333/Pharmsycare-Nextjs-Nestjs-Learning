import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

export class Banner {
  id: number;
  title?: string;
  description?: string;
  image: Attachment;
}

export class TypeSettings {
  isHome: boolean;
  layoutType: string;
  productCard: string;
}

@Entity('types')
export class Type extends CoreEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('json', { nullable: true })
  image: Attachment;

  @Column({ nullable: true })
  icon: string;

  @Column('json', { nullable: true })
  banners?: Banner[];

  @Column('json', { nullable: true })
  promotional_sliders?: Attachment[];

  @Column('json', { nullable: true })
  settings?: TypeSettings;

  @Column({ default: 'en' })
  language: string;

  @Column('simple-array', { nullable: true })
  translated_languages: string[];
}
