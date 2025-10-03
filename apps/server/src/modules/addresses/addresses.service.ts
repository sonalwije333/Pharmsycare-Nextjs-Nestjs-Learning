import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesDto } from './dto/get-addresses.dto';
import { User } from '../users/entities/user.entity';
import { paginate } from '../common/pagination/paginate';
import { SortOrder } from "../common/dto/generic-conditions.dto";
import { QueryAddressesOrderByColumn } from "../../common/enums/enums";

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    try {
      const { customer_id, ...addressData } = createAddressDto;

      // Check if customer exists
      const customer = await this.userRepository.findOne({
        where: { id: customer_id },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customer_id} not found`);
      }

      // If setting as default, remove default from other addresses
      if (addressData.default) {
        await this.addressRepository.update(
          { customer: { id: customer_id }, default: true },
          { default: false },
        );
      }

      const address = this.addressRepository.create({
        ...addressData,
        customer,
      });

      return await this.addressRepository.save(address);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create address');
    }
  }

  async findAll(getAddressesDto: GetAddressesDto): Promise<any> {
    try {
      const page = getAddressesDto.page ?? 1;
      const limit = getAddressesDto.limit ?? 10;
      const sortedBy = getAddressesDto.sortedBy ?? SortOrder.DESC;

      const skip = (page - 1) * limit;
      const take = limit;

      // Build where conditions
      const where: any = {};

      if (getAddressesDto.customer_id) {
        where.customer = { id: getAddressesDto.customer_id };
      }

      if (getAddressesDto.type) {
        where.type = getAddressesDto.type;
      }

      if (getAddressesDto.text) {
        where.title = ILike(`%${getAddressesDto.text}%`);
      }

      if (getAddressesDto.search) {
        const searchParams = getAddressesDto.search.split(';');
        for (const searchParam of searchParams) {
          const [key, value] = searchParam.split(':');
          if (key && value) {
            where[key] = ILike(`%${value}%`);
          }
        }
      }

      // Build order by
      let order: any = { created_at: 'DESC' };
      if (getAddressesDto.orderBy && sortedBy) {
        order = {};
        const orderField = this.getOrderByField(getAddressesDto.orderBy);
        order[orderField] = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
      }

      const [data, total] = await this.addressRepository.findAndCount({
        where,
        relations: ['customer'],
        skip,
        take,
        order,
      });

      const url = `/addresses?limit=${limit}&page=${page}`;

      return {
        data,
        ...paginate(total, page, limit, data.length, url),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch addresses');
    }
  }

  private getOrderByField(orderBy: QueryAddressesOrderByColumn): string {
    switch (orderBy) {
      case QueryAddressesOrderByColumn.TITLE:
        return 'title';
      case QueryAddressesOrderByColumn.TYPE:
        return 'type';
      case QueryAddressesOrderByColumn.CREATED_AT:
        return 'created_at';
      case QueryAddressesOrderByColumn.UPDATED_AT:
        return 'updated_at';
      default:
        return 'created_at';
    }
  }

  async findOne(id: number): Promise<Address> {
    try {
      const address = await this.addressRepository.findOne({
        where: { id },
        relations: ['customer'],
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      return address;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch address');
    }
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    try {
      const address = await this.findOne(id);
      const { customer_id, ...updateData } = updateAddressDto;

      // If customer is being updated
      if (customer_id && customer_id !== address.customer.id) {
        const customer = await this.userRepository.findOne({
          where: { id: customer_id },
        });

        if (!customer) {
          throw new NotFoundException(`Customer with ID ${customer_id} not found`);
        }
        address.customer = customer;
      }

      // If setting as default, remove default from other addresses
      if (updateData.default === true) {
        await this.addressRepository.update(
          { customer: { id: address.customer.id }, default: true, id: Not(id) },
          { default: false },
        );
      }

      Object.assign(address, updateData);

      return await this.addressRepository.save(address);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update address');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const address = await this.findOne(id);
      await this.addressRepository.remove(address);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete address');
    }
  }

  async setDefaultAddress(id: number): Promise<Address> {
    try {
      const address = await this.findOne(id);

      // Remove default from other addresses of the same customer
      await this.addressRepository.update(
        { customer: { id: address.customer.id }, default: true, id: Not(id) },
        { default: false },
      );

      address.default = true;
      return await this.addressRepository.save(address);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to set default address');
    }
  }

  async getCustomerAddresses(customerId: number): Promise<Address[]> {
    try {
      const customer = await this.userRepository.findOne({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }

      return await this.addressRepository.find({
        where: { customer: { id: customerId } },
        order: { default: 'DESC', created_at: 'DESC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch customer addresses');
    }
  }
}
