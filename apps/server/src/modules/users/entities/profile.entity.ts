import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { User } from './user.entity';
import { Attachment } from 'src/modules/common/entities/attachment.entity';
import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Social extends CoreEntity {
  @Column()
  type: string;

  @Column()
  link: string;

  // @ManyToOne(() => Profile, (profile) => profile.socials, {
  //   onDelete: 'CASCADE',
  // })
  profile: Profile;
}

@Entity()
export class Profile extends CoreEntity {
  @OneToOne(() => Attachment, { cascade: true, nullable: true, eager: true })
  @JoinColumn()
  avatar?: Attachment;

  @Column({ nullable: true })
  bio?: string;

  // @OneToMany(() => Social, (social) => social.profile, { cascade: true })
  // socials?: Social[];

  @Column({ nullable: true })
  contact?: string;

  @OneToOne(() => User, (user) => user.profile)
  customer?: User;
}
