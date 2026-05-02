// feedbacks/entities/feedback.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Review } from 'src/reviews/entities/review.entity';

@Entity('feedbacks')
@Index(['model_type', 'model_id']) // Composite index for faster lookups
export class Feedback extends CoreEntity {
  @ApiProperty({ description: 'Feedback ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID', example: '123' })
  @Column()
  user_id: string;

  @ApiProperty({
    description: 'Model type (e.g., product, order)',
    example: 'product',
  })
  @Column()
  model_type: string;

  @ApiProperty({
    description: 'Model ID (e.g., product ID, order ID)',
    example: '456',
  })
  @Column()
  model_id: string;

  @ApiProperty({
    description: 'Positive feedback',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', nullable: true })
  positive?: boolean;

  @ApiProperty({
    description: 'Negative feedback',
    example: false,
    required: false,
  })
  @Column({ type: 'boolean', nullable: true })
  negative?: boolean;

  @ManyToOne(() => Review, (review) => review.feedbacks)
  review?: Review;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
