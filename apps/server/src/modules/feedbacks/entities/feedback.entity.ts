import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Feedback extends CoreEntity {
    @Column({ nullable: true })
    user_id?: string;

    @Column()
    model_type: string;

    @Column()
    model_id: string;

    @Column({ nullable: true, default: false })
    positive?: boolean;

    @Column({ nullable: true, default: false })
    negative?: boolean;
}