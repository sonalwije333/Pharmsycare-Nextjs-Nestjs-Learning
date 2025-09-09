import { CoreEntity } from "../../common/entities/core.entity";
import { Shop } from "../../shops/entites/shop.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity()
export class RefundPolicy extends CoreEntity {
    @Column()
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    target: string;

    @Column()
    status: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ default: 'en' })
    language: string;

    @Column({ nullable: true })
    shop_id?: string;

    @ManyToOne(() => Shop, { eager: true })
    @JoinColumn({ name: 'shop_id' })
    shop?: Shop;

    @Column({ type: 'simple-array', nullable: true })
    translated_languages: string[];

    @Column({ nullable: true })
    deleted_at?: string;
}