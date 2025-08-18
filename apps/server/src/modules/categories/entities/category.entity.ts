import { Attachment } from 'src/modules/common/entities/attachment.entity';
import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { Type } from 'src/modules/types/entities/type.entity';
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
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  image: Attachment;

  @Column({ nullable: true })
  icon: string;

  @Column()
  language: string;

  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ManyToOne(() => Type, (type) => type.categories, {
    nullable: false,
    eager: true, // optional: automatically load the type
    onDelete: 'CASCADE', // optional: deletes categories if type is deleted
  })
  @JoinColumn({ name: 'type_id' })
  type: Type;
}
