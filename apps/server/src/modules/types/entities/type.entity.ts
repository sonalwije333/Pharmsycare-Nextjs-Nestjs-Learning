import { Category } from 'src/modules/categories/entities/category.entity';
import { Attachment } from 'src/modules/common/entities/attachment.entity';
import { BaseEntity } from 'src/modules/common/entities/base.entity';
import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';

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

    @OneToMany(() => Category, (category) => category.type, {
        cascade: true,
    })
    categories: Category[];
}