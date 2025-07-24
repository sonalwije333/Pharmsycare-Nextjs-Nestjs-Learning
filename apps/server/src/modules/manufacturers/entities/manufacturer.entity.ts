import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';
import { Type } from '../../types/entities/type.entity';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/modules/common/entities/base.entity';

@Entity()
export class Manufacturer extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug?: string;
}
