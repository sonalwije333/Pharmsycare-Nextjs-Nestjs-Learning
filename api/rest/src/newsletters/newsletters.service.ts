import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import { NewsletterStatus, NewsletterSubscriptionResponse, NewsletterUnsubscribeResponse } from './dto/newsletter-response.dto';

interface Subscriber {
  email: string;
  name?: string;
  subscribedAt: Date;
  status: NewsletterStatus;
}

@Injectable()
export class NewslettersService {
  private readonly logger = new Logger(NewslettersService.name);
  private subscribers: Map<string, Subscriber> = new Map();

  async subscribe(subscribeDto: CreateNewSubscriberDto): Promise<NewsletterSubscriptionResponse> {
    const { email, name } = subscribeDto;
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if already subscribed
    const existing = this.subscribers.get(normalizedEmail);
    
    if (existing) {
      if (existing.status === NewsletterStatus.SUBSCRIBED) {
        throw new ConflictException('Email already subscribed to newsletter');
      } else if (existing.status === NewsletterStatus.UNSUBSCRIBED) {
        // Reactivate subscription
        existing.status = NewsletterStatus.SUBSCRIBED;
        existing.name = name || existing.name;
        existing.subscribedAt = new Date();
        this.subscribers.set(normalizedEmail, existing);
        
        this.logger.log(`Email resubscribed: ${normalizedEmail}`);
        
        return {
          message: 'Email successfully resubscribed to newsletter',
          status: NewsletterStatus.SUBSCRIBED,
          email: normalizedEmail,
        };
      }
    }

    // Create new subscriber
    const newSubscriber: Subscriber = {
      email: normalizedEmail,
      name: name,
      subscribedAt: new Date(),
      status: NewsletterStatus.SUBSCRIBED,
    };

    this.subscribers.set(normalizedEmail, newSubscriber);
    this.logger.log(`New subscriber added: ${normalizedEmail}`);
    this.logger.log(`Total subscribers: ${this.subscribers.size}`);

    return {
      message: 'Your email successfully subscribed to newsletter',
      status: NewsletterStatus.SUBSCRIBED,
      email: normalizedEmail,
    };
  }

  async unsubscribe(email: string): Promise<NewsletterUnsubscribeResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    const subscriber = this.subscribers.get(normalizedEmail);

    if (!subscriber) {
      throw new NotFoundException(`Email ${email} not found in subscribers`);
    }

    if (subscriber.status === NewsletterStatus.UNSUBSCRIBED) {
      return {
        success: true,
        message: 'Email already unsubscribed from newsletter',
        status: NewsletterStatus.UNSUBSCRIBED,
      };
    }

    subscriber.status = NewsletterStatus.UNSUBSCRIBED;
    this.subscribers.set(normalizedEmail, subscriber);
    this.logger.log(`Email unsubscribed: ${normalizedEmail}`);

    return {
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      status: NewsletterStatus.UNSUBSCRIBED,
    };
  }

  async adminRemove(email: string): Promise<NewsletterUnsubscribeResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    const subscriber = this.subscribers.get(normalizedEmail);

    if (!subscriber) {
      throw new NotFoundException(`Email ${email} not found in subscribers`);
    }

    // Remove from subscribers list (hard delete for admin)
    this.subscribers.delete(normalizedEmail);
    this.logger.log(`Admin removed subscriber: ${normalizedEmail}`);
    this.logger.log(`Total subscribers: ${this.subscribers.size}`);

    return {
      success: true,
      message: `Subscriber with email ${email} removed successfully`,
      status: NewsletterStatus.UNSUBSCRIBED,
    };
  }

  // Helper method to get all subscribers (for internal use)
  getAllSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values());
  }

  // Helper method to get active subscribers count
  getActiveSubscribersCount(): number {
    return Array.from(this.subscribers.values()).filter(
      s => s.status === NewsletterStatus.SUBSCRIBED
    ).length;
  }
}