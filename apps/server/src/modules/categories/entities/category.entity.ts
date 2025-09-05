// src/modules/categories/entities/category.entity.ts
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { Type } from '../../types/entities/type.entity';
import {
    Column,
    Entity,
    ManyToOne,
    OneToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';

@Entity()
export class Category extends CoreEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    details?: string;

    @Column({ nullable: true })
    icon?: string;

    @Column({ default: 'en' })
    language: string;

    @Column({ type: 'json', nullable: true })
    translated_languages?: string[];

    @Column({ default: 0 })
    products_count?: number;

    @Column({ default: false })
    is_approved?: boolean;

    // Self-referencing relationship for parent category
    @ManyToOne(() => Category, category => category.children, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'parent_id' })
    parent?: Category;

    @OneToMany(() => Category, category => category.parent)
    children?: Category[];

    // Relationship with Type
    @ManyToOne(() => Type, type => type.categories, {
        nullable: true,
        eager: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'type_id' })
    type?: Type;

    // Image relationships
    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    image?: Attachment;

    @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinTable()
    banners?: Attachment[];

    @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinTable()
    promotional_sliders?: Attachment[];
}