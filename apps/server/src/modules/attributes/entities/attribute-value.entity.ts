import { Attribute } from './attribute.entity';
import {CoreEntity} from "../../common/entities/core.entity";

export class AttributeValue extends CoreEntity {
  shop_id: number;
  value: string;
  meta?: string;
  attribute: Attribute;
}
