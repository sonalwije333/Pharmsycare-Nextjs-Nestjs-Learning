import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import {PaymentIntent} from "./entries/payment-intent.entity";

@Injectable()
export class PaymentIntentService {
  constructor(
    @InjectRepository(PaymentIntent)
    private readonly paymentIntentRepository: Repository<PaymentIntent>,
  ) {}

  async getPaymentIntent(query: GetPaymentIntentDto): Promise<PaymentIntent> {
    const paymentIntent = await this.paymentIntentRepository.findOne({
      where: { tracking_number: query.tracking_number.toString() },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent for tracking number ${query.tracking_number} not found`);
    }

    return paymentIntent;
  }

  async createPaymentIntent(paymentIntentData: Partial<PaymentIntent>): Promise<PaymentIntent> {
    const paymentIntent = this.paymentIntentRepository.create(paymentIntentData);
    return await this.paymentIntentRepository.save(paymentIntent);
  }

  async updatePaymentIntent(id: number, updateData: Partial<PaymentIntent>): Promise<PaymentIntent> {
    const paymentIntent = await this.paymentIntentRepository.findOne({ where: { id } });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent with ID ${id} not found`);
    }

    const updated = this.paymentIntentRepository.merge(paymentIntent, updateData);
    return await this.paymentIntentRepository.save(updated);
  }
}