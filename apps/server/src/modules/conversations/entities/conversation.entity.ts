import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Shop } from '../../shops/entites/shop.entity';

export class LatestMessage extends CoreEntity {
  body: string;
  conversation_id: string;
  user_id: string;
}

export class Conversation extends CoreEntity {
  shop_id: number;
  unseen: boolean;
  user_id: string;
  user: User;
  shop: Shop;
  latest_message: LatestMessage;
}
