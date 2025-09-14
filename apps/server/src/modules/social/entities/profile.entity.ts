// src/modules/users/entities/profile.entity.ts
import { Entity, OneToMany } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Social } from '../../social/entities/social.entity';

@Entity()
export class Profile extends CoreEntity {
    // ... other profile fields ...

    @OneToMany(() => Social, (social) => social.profile)
    socials: Social[];
}