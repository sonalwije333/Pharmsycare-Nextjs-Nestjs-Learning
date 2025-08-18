import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Shop extends BaseEntity {
  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'bool', default: true })
  in_active: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;
}
