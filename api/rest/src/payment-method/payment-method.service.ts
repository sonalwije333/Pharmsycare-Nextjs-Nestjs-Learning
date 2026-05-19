import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto, PaymentMethodPaginator } from './dto/get-payment-methods.dto';
import { SetDefaultCardDto } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { paginate } from 'src/common/pagination/paginate';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { SortOrder } from 'src/common/enums/enums';
import { PaymentMethodOrderByColumn } from 'src/common/enums/payment-method.enum';


@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const existingMethod = await this.paymentMethodRepository.findOne({
      where: { method_key: createPaymentMethodDto.method_key, user_id: createPaymentMethodDto.user_id },
    });
    
    if (existingMethod) {
      throw new ConflictException('Payment method already exists for this user');
    }

    const count = await this.paymentMethodRepository.count({
      where: { user_id: createPaymentMethodDto.user_id },
    });
    const isFirst = count === 0;

    const paymentMethod = this.paymentMethodRepository.create({
      ...createPaymentMethodDto,
      default_card: isFirst ? true : (createPaymentMethodDto.default_card || false),
    });

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findAll({
    page = 1,
    limit = 30,
    text,
    default_card,
    user_id,
    type,
    orderBy = PaymentMethodOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetPaymentMethodsDto): Promise<PaymentMethodPaginator> {
    const queryBuilder = this.paymentMethodRepository.createQueryBuilder('payment_method');

    if (user_id) {
      queryBuilder.andWhere('payment_method.user_id = :user_id', { user_id });
    }

    if (default_card !== undefined) {
      queryBuilder.andWhere('payment_method.default_card = :default_card', { default_card });
    }

    if (type) {
      queryBuilder.andWhere('payment_method.type = :type', { type });
    }

    if (text) {
      queryBuilder.andWhere(
        '(payment_method.owner_name LIKE :text OR payment_method.last4 LIKE :text OR payment_method.network LIKE :text)',
        { text: `%${text}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case PaymentMethodOrderByColumn.NETWORK:
        orderColumn = 'payment_method.network';
        break;
      case PaymentMethodOrderByColumn.TYPE:
        orderColumn = 'payment_method.type';
        break;
      case PaymentMethodOrderByColumn.UPDATED_AT:
        orderColumn = 'payment_method.updated_at';
        break;
      default:
        orderColumn = 'payment_method.created_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/payment-methods?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);

    Object.assign(paymentMethod, updatePaymentMethodDto);
    paymentMethod.updated_at = new Date();

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const paymentMethod = await this.findOne(id);

    // Perform a hard delete so the row is removed from the database
    await this.paymentMethodRepository.delete(id);

    return {
      success: true,
      message: `Payment method #${id} removed successfully`,
    };
  }

  async setDefaultCard(setDefaultCardDto: SetDefaultCardDto): Promise<PaymentMethod> {
    const { method_id, user_id } = setDefaultCardDto;

    // Reset all default cards for this user
    await this.paymentMethodRepository.update(
      { user_id, default_card: true },
      { default_card: false },
    );

    // Set the selected card as default
    await this.paymentMethodRepository.update(
      { method_key: method_id, user_id },
      { default_card: true },
    );

    const updatedMethod = await this.paymentMethodRepository.findOne({
      where: { method_key: method_id, user_id },
    });

    if (!updatedMethod) {
      throw new NotFoundException(`Payment method with key ${method_id} not found for this user`);
    }

    return updatedMethod;
  }

  async savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const existingMethod = await this.paymentMethodRepository.findOne({
      where: { method_key: createPaymentMethodDto.method_key, user_id: createPaymentMethodDto.user_id },
    });
    
    if (existingMethod) {
      return existingMethod;
    }
    
    return this.create(createPaymentMethodDto);
  }

  async findByUser(userId: number): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { user_id: userId },
      order: { default_card: 'DESC', created_at: 'DESC' },
    });
  }
}