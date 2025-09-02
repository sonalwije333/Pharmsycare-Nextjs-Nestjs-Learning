import { AttributeValue } from './attribute-value.entity';
import {CoreEntity} from "../../common/entities/core.entity";
import {Shop} from "../../shops/entites/shop.entity";

export class Attribute extends CoreEntity {
  name: string;
  shop_id: string;
  shop: Shop;
  slug: string;
  values: AttributeValue[];
  language: string;
  translated_languages: string[];
}
