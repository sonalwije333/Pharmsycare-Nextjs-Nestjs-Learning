import { Address } from 'src/modules/addresses/entities/address.entity';
import { Profile } from './profile.entity';
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import {
    Entity,
    Column,
    OneToOne,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Unique, ManyToMany,
} from 'typeorm';
import { Shop } from '../../shops/entites/shop.entity';
import { AiTask } from '../../ai/entities/ai.entity';
import {StoreNotice} from "../../store-notices/entities/store-notices.entity";

@Entity()
export class User extends CoreEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToOne(() => Profile, { nullable: true, cascade: true, eager: true })
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => Shop, (shop) => shop.owner, { cascade: true })
  shops?: Shop[];

  @ManyToOne(() => Shop, { nullable: true, eager: true })
  @JoinColumn()
  managed_shop?: Shop;

  @Column({ default: true })
  is_active?: boolean;

  @OneToMany(() => Address, (address) => address.customer, { cascade: true })
  address?: Address[];

  @OneToMany(() => Permission, (permission) => permission.user, {
    cascade: true,
  })
  permissions?: Permission[];
  @OneToMany(() => AiTask, (aiTask) => aiTask.user, { cascade: true })
  ai_tasks?: AiTask[];
  @Column({ type: 'json', nullable: true })
  wallet?: any;
    @ManyToMany(() => StoreNotice, storeNotice => storeNotice.users)
    storeNotices: StoreNotice[];
}

@Entity()
@Unique(['name', 'user']) // 🛡️ Enforces one permission per user
export class Permission extends CoreEntity {
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  guard_name?: string;

  @Column({ type: 'json', nullable: true })
  pivot?: any;

  @ManyToOne(() => User, (user) => user.permissions)
  user: User;



}
