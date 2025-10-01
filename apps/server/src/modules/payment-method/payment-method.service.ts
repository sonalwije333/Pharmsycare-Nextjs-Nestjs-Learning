import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGateWay } from './entities/payment-gateway.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { DefaultCartDto } from './dto/set-default-card.dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentGateWay)
    private readonly paymentGatewayRepository: Repository<PaymentGateWay>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // Set as default if no default exists
    if (createPaymentMethodDto.default_card) {
      await this.clearDefaultCards();
    }

    const paymentMethod = this.paymentMethodRepository.create(createPaymentMethodDto);
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  async findAll(): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.find({
      relations: ['payment_gateways'],
    });
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
      relations: ['payment_gateways'],
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);

    if (updatePaymentMethodDto.default_card) {
      await this.clearDefaultCards();
    }

    const updated = this.paymentMethodRepository.merge(paymentMethod, updatePaymentMethodDto);
    return await this.paymentMethodRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const paymentMethod = await this.findOne(id);
    await this.paymentMethodRepository.remove(paymentMethod);
  }

  async saveDefaultCart(defaultCartDto: DefaultCartDto): Promise<PaymentMethod> {
    await this.clearDefaultCards();

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { method_key: defaultCartDto.method_id }
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${defaultCartDto.method_id} not found`);
    }

    paymentMethod.default_card = true;
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  private async clearDefaultCards(): Promise<void> {
    await this.paymentMethodRepository
      .createQueryBuilder()
      .update(PaymentMethod)
      .set({ default_card: false })
      .where('default_card = :default', { default: true })
      .execute();
  }
}