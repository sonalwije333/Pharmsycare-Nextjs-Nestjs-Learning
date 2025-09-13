import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()

export class MyReports extends CoreEntity {
    @Column({ type: 'text' })
    message: string;

    @Column({ nullable: true })
    title?: string;

    @Column({
        type: 'enum',
        enum: ['bug', 'feature', 'complaint', 'suggestion', 'other'],
        default: 'other'
    })
    type: string;

    @Column({
        type: 'enum',
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    })
    status: string;

    @Column()
    user_id: string;

    @Column({ nullable: true })
    user_email?: string;

    @Column({ nullable: true })
    priority?: string;

    @Column({ type: 'json', nullable: true })
    metadata?: any;

    @Column({ default: 'en' })
    language: string;

    @Column('simple-array', { nullable: true })
    translated_languages?: string[];

    @Column({ nullable: true })
    resolved_at?: Date;

    @Column({ nullable: true })
    deleted_at?: Date;
}