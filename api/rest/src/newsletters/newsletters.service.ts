// newsletters/newsletters.service.ts
import { Injectable } from '@nestjs/common';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';

@Injectable()
export class NewslettersService {
  async subscribeToNewsletter({ email }: CreateNewSubscriberDto) {
    // TODO: Save to database
    return {
      message: 'Your email successfully subscribed'
    };
  }
}