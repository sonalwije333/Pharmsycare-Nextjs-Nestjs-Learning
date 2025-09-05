import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Author extends CoreEntity {
    @Column({ type: 'text', nullable: true })
    bio?: string;

    @Column({ nullable: true })
    born?: string;

    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    cover_image?: Attachment;

    @Column({ nullable: true })
    death?: string;

    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    image?: Attachment;

    @Column({ default: false })
    is_approved?: boolean;

    @Column({ nullable: true })
    languages?: string;

    @Column()
    name: string;

    @Column({ default: 0 })
    products_count?: number;

    @Column({ type: 'text', nullable: true })
    quote?: string;

    @Column({ unique: true })
    slug?: string;

    @Column({ type: 'json', nullable: true })
    socials?: ShopSocials;

    @Column({ default: 'en' })
    language?: string;

    @Column({ type: 'json', nullable: true })
    translated_languages?: string[];

    @Column({ nullable: true })
    shop_id?: string;
}