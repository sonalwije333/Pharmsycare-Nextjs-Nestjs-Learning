import { Category } from 'src/modules/categories/entities/category.entity';
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
import {Tag} from "../../tags/entities/tag.entity";

// @Entity()
// export class TypeSettings {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: false })
//   isHome: boolean;

//   @Column({ default: 'default-layout' })
//   layoutType: string;

//   @Column({ default: 'default-card' })
//   productCard: string;
// }

@Entity()
export class Type extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  image: Attachment;

  @Column({ nullable: true, default: 'default_icon' })
  icon: string;

  @Column({ type: 'json', nullable: true })
  banners: any[];

  @Column({ type: 'json', nullable: true })
  promotional_sliders: any[];

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ nullable: true, default: 'en' })
  language: string;

  @Column({ type: 'json', nullable: true })
  translated_languages: string[];

  @OneToMany(() => Tag, tag => tag.type)
    tags: Tag[];
  @OneToMany(() => Category, (category) => category.type, {
    cascade: true,
  })
  categories: Category[];
}

// @Entity()
// export class Banner {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ nullable: true })
//   title?: string;

//   @Column({ nullable: true, type: 'text' })
//   description?: string;

//   @OneToOne(() => Attachment, { cascade: true, eager: true })
//   @JoinColumn()
//   image: Attachment;

//   // @ManyToOne(() => Type, (type) => type.banners, { onDelete: 'CASCADE' })
//   // type: Type;
// }
