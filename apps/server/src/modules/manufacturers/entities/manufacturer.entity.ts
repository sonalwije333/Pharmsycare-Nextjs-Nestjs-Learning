import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Manufacturer extends CoreEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'json', nullable: true })
    translated_languages?: string[];

    @Column({ default: 'en' })
    language: string;

    @Column({ nullable: true })
    deleted_at?: Date;
}