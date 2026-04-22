// reviews/entities/review.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
@Entity('reviews')
export class Review extends CoreEntity {
  @ApiProperty({ description: 'Review ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Review rating', example: 5, minimum: 1, maximum: 5 })
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({ description: 'Review comment', example: 'Excellent product!', required: false })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ type: () => Shop, description: 'Associated shop' })
  @ManyToOne(() => Shop, shop => shop.reviews)
  shop: Shop;

  @ApiProperty({ type: () => Order, description: 'Associated order' })
  @ManyToOne(() => Order, order => order.reviews)
  order: Order;

  @ApiProperty({ type: () => User, description: 'Customer who wrote review' })
  @ManyToOne(() => User, user => user.reviews)
  customer: User;

  @ApiProperty({ type: [Attachment], description: 'Review photos', required: false })
  @Column({ type: 'json', nullable: true })
  photos?: Attachment[];

  @ApiProperty({ type: () => User, description: 'User who wrote review' })
  @ManyToOne(() => User, user => user.reviews)
  user: User;

  @ApiProperty({ type: () => Product, description: 'Reviewed product' })
  @ManyToOne(() => Product, product => product.reviews)
  product: Product;

  @ApiProperty({ type: () => [Feedback], description: 'Feedbacks on this review' })
  @OneToMany(() => Feedback, feedback => feedback.review)
  feedbacks: Feedback[];

  @ApiProperty({ type: () => Feedback, description: 'Current user feedback', required: false })
  my_feedback?: Feedback;

  @ApiProperty({ description: 'Positive feedbacks count', default: 0 })
  @Column({ default: 0 })
  positive_feedbacks_count: number;

  @ApiProperty({ description: 'Negative feedbacks count', default: 0 })
  @Column({ default: 0 })
  negative_feedbacks_count: number;

  @ApiProperty({ description: 'User ID', example: 1 })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Product ID', example: 1 })
  @Column()
  product_id: number;

  // @ApiProperty({ type: () => [Report], description: 'Abusive reports on this review' })
  // @OneToMany(() => Report, report => report.model_id)
  // abusive_reports?: Report[];

  // @ApiProperty({ description: 'Shop ID', required: false })
  // @Column({ nullable: true })
  // shop_id?: string;

  @ApiProperty({ description: 'Variation option ID', required: false })
  @Column({ nullable: true })
  variation_option_id?: string;

  @ApiProperty({ description: 'Abusive reports count', default: 0 })
  @Column({ default: 0 })
  abusive_reports_count?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}