import { CoreEntity } from "../../common/entities/core.entity";
import { Shop } from "../../shops/entites/shop.entity";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import {WithdrawStatus} from "../../../common/enums/enums";

@Entity()
export class Withdraw extends CoreEntity {
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: WithdrawStatus,
        default: WithdrawStatus.PENDING
    })
    status: WithdrawStatus;

    @Column()
    shop_id: number;

    @ManyToOne(() => Shop, { eager: true })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @Column()
    payment_method: string;

    @Column({ type: 'json', nullable: true })
    details: string;

    @Column({ type: 'text', nullable: true })
    note: string;

}