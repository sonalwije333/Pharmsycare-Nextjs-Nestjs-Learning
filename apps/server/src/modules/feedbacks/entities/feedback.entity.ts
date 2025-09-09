import { CoreEntity } from '../../common/entities/core.entity';
import {Column, Entity, Index, JoinColumn, ManyToOne} from 'typeorm';
import {Question} from "../../questions/entities/question.entity";

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

    @ManyToOne(() => Question, question => question.feedbacks, { nullable: true })
    @JoinColumn({ name: 'model_id', referencedColumnName: 'id' })
    question?: Question;
}