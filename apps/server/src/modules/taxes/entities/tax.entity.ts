import { CoreEntity } from "../../common/entities/core.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Tax extends CoreEntity {
    @Column()
    name: string;

    @Column('decimal', { precision: 5, scale: 2 })
    rate: number;

    @Column({ default: false })
    is_global: boolean;

    @Column({ nullable: true })
    country?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ nullable: true })
    zip?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true, default: 0 })
    priority?: number;

    @Column({ default: false })
    on_shipping: boolean;
}