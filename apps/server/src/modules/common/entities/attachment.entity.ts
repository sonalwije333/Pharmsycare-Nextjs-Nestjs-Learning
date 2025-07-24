import { Entity, Column } from 'typeorm';
import { CoreEntity } from 'src/modules/common/entities/core.entity';

@Entity()
export class Attachment extends CoreEntity {
  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ nullable: true })
  original?: string;
}
