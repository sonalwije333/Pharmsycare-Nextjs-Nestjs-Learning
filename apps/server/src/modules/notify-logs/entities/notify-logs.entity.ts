import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['receiver', 'is_read'])
@Index(['notify_type', 'created_at'])
export class NotifyLogs extends CoreEntity {
    @Column()
    receiver: string;

    @Column()
    sender: string;

    @Column()
    notify_type: string;

    @Column()
    notify_receiver_type: string;

    @Column({ default: false })
    is_read: boolean;

    @Column({ type: 'text' })
    notify_text: string;

    @Column({ nullable: true })
    related_id?: string;

    @Column({ nullable: true })
    deleted_at?: Date;
}