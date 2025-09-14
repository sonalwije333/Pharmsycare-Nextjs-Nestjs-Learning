import { CoreEntity } from "../../common/entities/core.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class TermsAndConditions extends CoreEntity {
    @Column({ type: 'json', nullable: true })
    translated_languages: string[];

    @Column({ default: 'en' })
    language: string;

    @Column()
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ nullable: true })
    shop_id?: string;

    @Column({ nullable: true })
    type?: string;

    @Column({ nullable: true })
    issued_by?: string;

    @Column()
    user_id: string;

    @Column({ nullable: true })
    deleted_at?: string;

    @Column({ default: false })
    is_approved?: boolean;
}