import { CoreEntity } from "../../common/entities/core.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class RefundReason extends CoreEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ default: 'en' })
    language: string;

    @Column({ type: 'simple-array', nullable: true })
    translated_languages: string[];

    @Column({ nullable: true })
    deleted_at?: string;
}