import { ApiProperty } from '@nestjs/swagger';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export enum NewsletterStatus {
  SUBSCRIBED = 'SUBSCRIBED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}


export class NewsletterSubscriptionResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Your email successfully subscribed to newsletter',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Subscription status',
    enum: NewsletterStatus,
    example: NewsletterStatus.SUBSCRIBED,
    type: String,
  })
  status: NewsletterStatus;

  @ApiProperty({
    description: 'Subscriber email',
    example: 'user@example.com',
    type: String,
  })
  email: string;
}

export class NewsletterUnsubscribeResponse extends CoreMutationOutput {
  @ApiProperty({
    description: 'Unsubscription status',
    enum: NewsletterStatus,
    example: NewsletterStatus.UNSUBSCRIBED,
    type: String,
  })
  status: NewsletterStatus;
}