import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Report extends CoreEntity {
    @Column({ nullable: true, name: 'user_id' })
    userId?: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'model_id' })
    modelId: number;

    @Column({ name: 'model_type' })
    modelType: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ default: 'en' })
    language: string;

    @Column('simple-array', { nullable: true, name: 'translated_languages' })
    translatedLanguages?: string[];

    // @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    // createdAt: Date;

    @Column({ nullable: true, name: 'deleted_at' })
    deletedAt?: Date;
}