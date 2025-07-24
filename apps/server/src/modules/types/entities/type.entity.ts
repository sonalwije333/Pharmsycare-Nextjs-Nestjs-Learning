import { Attachment } from 'src/modules/common/entities/attachment.entity';
import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TypeSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isHome: boolean;

  @Column({ default: 'default-layout' })
  layoutType: string;

  @Column({ default: 'default-card' })
  productCard: string;
}

@Entity()
export class Type extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  image: Attachment;

  @Column({ nullable: true })
  icon: string;

  // Todo -> fix later
  // @OneToMany(() => Banner, (banner) => banner.type, {
  //   cascade: true,
  //   eager: true,
  // })
  // banners?: Banner[];

  // Todo -> fix later
  // @ManyToMany(() => Attachment, { cascade: true, eager: true })
  // @JoinTable()
  // promotional_sliders?: Attachment[];

  @OneToOne(() => TypeSettings, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  settings?: TypeSettings;

  @Column()
  language: string;

  @Column('simple-array', { nullable: true })
  translated_languages: string[];
}

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @OneToOne(() => Attachment, { cascade: true, eager: true })
  @JoinColumn()
  image: Attachment;

  // @ManyToOne(() => Type, (type) => type.banners, { onDelete: 'CASCADE' })
  // type: Type;
}
