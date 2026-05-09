import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesDto, AddressPaginator } from './dto/get-addresses.dto';
import { Address } from './entities/address.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { AddressOrderByColumn } from 'src/common/enums/address-type.enum';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { customer_id, address, ...rest } = createAddressDto;

    if (rest.default) {
      await this.addressesRepository.update(
        { customer_id, default: true },
        { default: false },
      );
    }

    const newAddress = this.addressesRepository.create({
      ...rest,
      address: address,
      customer_id,
    });

    return this.addressesRepository.save(newAddress);
  }

  async findAll({
    limit = 30,
    page = 1,
    customer_id,
    type,
    text,
    orderBy = AddressOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetAddressesDto): Promise<AddressPaginator> {
    const query = this.addressesRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.customer', 'customer');

    if (customer_id) {
      query.andWhere('address.customer_id = :customer_id', { customer_id });
    }

    if (type) {
      query.andWhere('address.type = :type', { type });
    }

    if (text) {
      query.andWhere(
        '(address.title LIKE :text OR address.address LIKE :text)',
        { text: `%${text}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case AddressOrderByColumn.TITLE:
        orderColumn = 'address.title';
        break;
      case AddressOrderByColumn.UPDATED_AT:
        orderColumn = 'address.updated_at';
        break;
      default:
        orderColumn = 'address.created_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    query.orderBy(orderColumn, orderDirection);
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    const url = `/address?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      current_page: paginationInfo.current_page,
      per_page: paginationInfo.per_page,
      total: paginationInfo.total,
      last_page: paginationInfo.last_page,
      first_page_url: paginationInfo.first_page_url,
      last_page_url: paginationInfo.last_page_url,
      next_page_url: paginationInfo.next_page_url,
      prev_page_url: paginationInfo.prev_page_url,
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findByCustomer(
    customerId: number,
    {
      limit = 30,
      page = 1,
      type,
      orderBy = AddressOrderByColumn.CREATED_AT,
      sortedBy = SortOrder.DESC,
    }: GetAddressesDto,
  ): Promise<AddressPaginator> {
    const query = this.addressesRepository
      .createQueryBuilder('address')
      .where('address.customer_id = :customerId', { customerId });

    if (type) {
      query.andWhere('address.type = :type', { type });
    }

    let orderColumn: string;
    switch (orderBy) {
      case AddressOrderByColumn.TITLE:
        orderColumn = 'address.title';
        break;
      case AddressOrderByColumn.UPDATED_AT:
        orderColumn = 'address.updated_at';
        break;
      default:
        orderColumn = 'address.created_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    query.orderBy(orderColumn, orderDirection);
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    const url = `/address/my-addresses?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      current_page: paginationInfo.current_page,
      per_page: paginationInfo.per_page,
      total: paginationInfo.total,
      last_page: paginationInfo.last_page,
      first_page_url: paginationInfo.first_page_url,
      last_page_url: paginationInfo.last_page_url,
      next_page_url: paginationInfo.next_page_url,
      prev_page_url: paginationInfo.prev_page_url,
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findOne(id: number): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id);

    if (updateAddressDto.default && !address.default) {
      await this.addressesRepository.update(
        { customer_id: address.customer_id, default: true },
        { default: false },
      );
    }

    const updateData: any = { ...updateAddressDto };

    if (updateAddressDto.address) {
      updateData.address = updateAddressDto.address;
    }

    await this.addressesRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const address = await this.findOne(id);

    await this.addressesRepository.softDelete(id);

    return {
      success: true,
      message: `Address with ID ${id} deleted successfully`,
    };
  }

  async setDefaultAddress(id: number, customerId: number): Promise<Address> {
    const address = await this.findOne(id);

    if (address.customer_id !== customerId) {
      throw new BadRequestException('Address does not belong to this customer');
    }

    await this.addressesRepository.update(
      { customer_id: customerId, default: true },
      { default: false },
    );

    address.default = true;
    return this.addressesRepository.save(address);
  }
}