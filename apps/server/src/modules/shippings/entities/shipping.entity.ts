import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';
import { ShippingType} from "../../../common/enums/enums";

@Entity()
export class Shipping extends CoreEntity {
    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ name: 'is_global', default: false })
    is_global: boolean;

    @Column({ type: 'enum', enum: ShippingType, default: ShippingType.FIXED })
    type: ShippingType;

    @Column({ name: 'deleted_at', nullable: true })
    deleted_at?: Date;
}