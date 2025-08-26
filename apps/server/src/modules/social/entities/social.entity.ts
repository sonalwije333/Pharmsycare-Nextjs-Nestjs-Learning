// src/modules/users/entities/social.entity.ts
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';

@Entity()
export class Social extends CoreEntity {
  @Column()
  type: string;

  @Column()
  link: string;

  @ManyToOne(() => Profile, (profile) => profile.socials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  profile: Profile;
}
