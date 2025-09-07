import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Faq extends CoreEntity {
    @Column({ type: 'json', nullable: true })
    translated_languages?: string[];

    @Column({ default: 'en' })
    language: string;

    @Column()
    @Index()
    faq_title: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text' })
    faq_description: string;

    @Column({ nullable: true })
    shop_id?: string;

    @Column({ nullable: true })
    issued_by?: string;

    @Column({ nullable: true })
    faq_type?: string;

    @Column({ nullable: true })
    user_id?: string;

    @Column({ nullable: true })
    deleted_at?: Date;
}