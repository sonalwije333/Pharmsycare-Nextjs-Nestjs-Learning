import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, OneToOne, JoinColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import { Attachment } from '../../common/entities/attachment.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class FlashSale extends CoreEntity {
    @Column()
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column()
    start_date: string;

    @Column()
    end_date: string;

    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    image?: Attachment;

    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    cover_image?: Attachment;

    @Column()
    type: string;

    @Column({ nullable: true })
    rate?: string;

    @Column({ default: false })
    sale_status: boolean;

    @Column({ type: 'json' })
    sale_builder: any;

    @Column({ default: 'en' })
    language: string;

    @Column({ type: 'json', nullable: true })
    translated_languages?: string[];

    @ManyToMany(() => Product, { eager: true, cascade: true })
    @JoinTable()
    products: Product[];

    @Column({ nullable: true })
    deleted_at?: Date;
}