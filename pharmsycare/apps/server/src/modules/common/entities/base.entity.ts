import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Column,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { getRequestContext } from 'src/middleware/request-context.middleware';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User;

  @BeforeInsert()
  setCreatedBy() {
    const user = getRequestContext()?.user;
    if (user) {
      this.createdBy = user;
    }
  }

  @BeforeUpdate()
  setUpdatedBy() {
    const user = getRequestContext()?.user;
    if (user) {
      this.updatedBy = user;
    }
  }

  toString(): string {
    return this.id;
  }
}
