import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../../payment-method/entities/payment-method.entity';
import { PaymentGateWay } from '../../../payment-method/entities/payment-gateway.entity';
import * as paymentGatewayData from '../../../db/pickbazar/payment-gateway.json';
import * as paymentMethodData from '../../../db/pickbazar/payment-methods.json';

@Injectable()
export class PaymentMethodSeederService {
  private readonly logger = new Logger(PaymentMethodSeederService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentGateWay)
    private paymentGatewayRepository: Repository<PaymentGateWay>,
  ) {}

  async seed() {
    this.logger.log('🌱 Seeding payment methods...');

    try {
      // Seed payment gateways
      await this.seedPaymentGateways();
      
      // Seed payment methods
      await this.seedPaymentMethods();
      
      this.logger.log('✅ Payment methods seeded successfully');
    } catch (error) {
      this.logger.error(`❌ Failed to seed payment methods: ${error.message}`);
      throw error;
    }
  }

  async seedPaymentGateways() {
    const gateways = paymentGatewayData.payment_gateways;
    
    for (const gatewayData of gateways) {
      const exists = await this.paymentGatewayRepository.findOne({
        where: { gateway_name: gatewayData.gateway_name },
      });
      
      if (!exists) {
        const gateway = this.paymentGatewayRepository.create({
          user_id: 1, // Admin user
          customer_id: null,
          gateway_name: gatewayData.gateway_name,
          created_at: new Date(gatewayData.created_at),
          updated_at: new Date(gatewayData.updated_at),
        });
        
        await this.paymentGatewayRepository.save(gateway);
        this.logger.debug(`Seeded payment gateway: ${gatewayData.gateway_name}`);
      }
    }
  }

  async seedPaymentMethods() {
    const methods = paymentMethodData.payment_methods;
    
    for (const methodData of methods) {
      const exists = await this.paymentMethodRepository.findOne({
        where: { method_key: methodData.method_key },
      });
      
      if (!exists) {
        const paymentMethod = this.paymentMethodRepository.create({
          method_key: methodData.method_key,
          default_card: methodData.default_card,
          payment_gateway_id: methodData.payment_gateway_id,
          fingerprint: methodData.fingerprint,
          owner_name: methodData.owner_name,
          network: methodData.network,
          type: methodData.type,
          last4: methodData.last4,
          expires: methodData.expires,
          created_at: new Date(methodData.created_at),
          updated_at: new Date(methodData.updated_at),
        });
        
        await this.paymentMethodRepository.save(paymentMethod);
        this.logger.debug(`Seeded payment method: ${methodData.method_key}`);
      }
    }
  }

  async clear() {
    this.logger.log('🗑️ Clearing payment methods...');
    
    try {
      await this.paymentMethodRepository.delete({});
      await this.paymentGatewayRepository.delete({});
      
      this.logger.log('✅ Payment methods cleared successfully');
    } catch (error) {
      this.logger.error(`❌ Failed to clear payment methods: ${error.message}`);
      throw error;
    }
  }

  async seedSpecific(type: string) {
    this.logger.log(`🌱 Seeding specific payment method data: ${type}`);
    
    switch (type) {
      case 'gateways':
        await this.seedPaymentGateways();
        break;
      case 'methods':
        await this.seedPaymentMethods();
        break;
      default:
        await this.seed();
    }
  }
}