// payment-method/payment-method.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto, PaymentMethodPaginator } from './dto/get-payment-methods.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGateWay } from './entities/payment-gateway.entity';
import { paginate } from 'src/common/pagination/paginate';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class PaymentMethodService {
  private paymentMethods: PaymentMethod[] = [];

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const existingMethod = this.paymentMethods.find(
      (pm) => pm.method_key === createPaymentMethodDto.method_key
    );
    
    if (existingMethod) {
      throw new ConflictException('Payment method already exists');
    }

    // If this is the first payment method, make it default
    const isFirst = this.paymentMethods.length === 0;
    
    const newPaymentMethod: PaymentMethod = {
      id: Date.now(),
      method_key: createPaymentMethodDto.method_key,
      default_card: isFirst ? true : (createPaymentMethodDto.default_card || false),
      payment_gateway_id: createPaymentMethodDto.payment_gateway_id,
      fingerprint: createPaymentMethodDto.fingerprint,
      owner_name: createPaymentMethodDto.owner_name,
      network: createPaymentMethodDto.network,
      type: createPaymentMethodDto.type,
      last4: createPaymentMethodDto.last4,
      expires: createPaymentMethodDto.expires,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.paymentMethods.push(newPaymentMethod);
    return newPaymentMethod;
  }

  async findAll({ limit, page, text, default_card }: GetPaymentMethodsDto): Promise<PaymentMethodPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 10;

    let data: PaymentMethod[] = [...this.paymentMethods];

    if (text) {
      data = data.filter(pm => 
        pm.owner_name?.toLowerCase().includes(text.toLowerCase()) ||
        pm.last4?.includes(text) ||
        pm.network?.toLowerCase().includes(text.toLowerCase())
      );
    }

    if (default_card !== undefined) {
      data = data.filter(pm => pm.default_card === default_card);
    }

    data.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/cards?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = this.paymentMethods.find(pm => pm.id === id);
    
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const index = this.paymentMethods.findIndex(pm => pm.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    this.paymentMethods[index] = {
      ...this.paymentMethods[index],
      ...updatePaymentMethodDto,
      updated_at: new Date(),
    };
    
    return this.paymentMethods[index];
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const index = this.paymentMethods.findIndex(pm => pm.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    this.paymentMethods.splice(index, 1);
    
    return {
      success: true,
      message: `Payment method #${id} removed successfully`,
    };
  }

  async saveDefaultCart(defaultCart: DefaultCart): Promise<PaymentMethod> {
    const { method_id } = defaultCart;
    
    // Reset all default cards
    this.paymentMethods = this.paymentMethods.map(pm => ({
      ...pm,
      default_card: pm.method_key === method_id,
    }));
    
    const updatedMethod = this.paymentMethods.find(pm => pm.method_key === method_id);
    
    if (!updatedMethod) {
      throw new NotFoundException(`Payment method with key ${method_id} not found`);
    }
    
    return updatedMethod;
  }

  async savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // Check if payment method already exists
    const existingMethod = this.paymentMethods.find(
      (pm) => pm.method_key === createPaymentMethodDto.method_key
    );
    
    if (existingMethod) {
      return existingMethod;
    }
    
    return this.create(createPaymentMethodDto);
  }
}