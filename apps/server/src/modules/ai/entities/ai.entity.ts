import { Entity, Column, ManyToOne } from 'typeorm';
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AiStatus, AiTaskType } from 'src/common/enums/enums';

@Entity()
export class AiTask extends CoreEntity {
  @ApiProperty()
  @Column()
  prompt: string;

  @ApiProperty({ enum: AiTaskType })
  @Column({
    type: 'enum',
    enum: AiTaskType,
    default: AiTaskType.DESCRIPTION_GENERATION,
  })
  task_type: AiTaskType;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  context?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  max_length?: number;

  @ApiProperty({ enum: AiStatus })
  @Column({ type: 'enum', enum: AiStatus, default: AiStatus.PROCESSING })
  status: AiStatus;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  result?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @ManyToOne(() => User, (user) => user.ai_tasks, { nullable: true })
  user?: User;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  user_id?: number;
}
