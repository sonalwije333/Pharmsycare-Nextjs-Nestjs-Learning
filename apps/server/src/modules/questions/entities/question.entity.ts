import { CoreEntity } from '../../common/entities/core.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';

@Entity()
export class Question extends CoreEntity {
    @Column()
    @Index()
    user_id: number;

    @Column()
    @Index()
    product_id: number;

    @Column({ nullable: true })
    @Index()
    shop_id?: number;

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text', nullable: true })
    answer?: string;

    @Column({ default: 0 })
    positive_feedbacks_count: number;

    @Column({ default: 0 })
    negative_feedbacks_count: number;

    // @ManyToOne(() => Product, { eager: true })
    // @JoinColumn({ name: 'product_id' })
    // product: Product;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Feedback, feedback => feedback.question)
    feedbacks?: Feedback[];

    // This would be populated in service based on current user
    my_feedback?: Feedback;
}