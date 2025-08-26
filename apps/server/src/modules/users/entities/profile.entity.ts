// src/modules/users/entities/profile.entity.ts
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { Attachment } from 'src/modules/common/entities/attachment.entity';
import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Social } from '../../social/entities/social.entity';

@Entity()
export class Profile extends CoreEntity {
  @OneToOne(() => Attachment, { cascade: true, nullable: true, eager: true })
  @JoinColumn()
  avatar?: Attachment;

  @Column({ nullable: true })
  bio?: string;

  @OneToMany(() => Social, (social) => social.profile, { cascade: true })
  socials?: Social[];

  @Column({ nullable: true })
  contact?: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  customer?: User;
}
