// coupons/coupons.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
  GetCouponsDto,
  CouponPaginator,
} from './dto/get-coupons.dto';
import { VerifyCouponResponse } from './dto/verify-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryCouponsOrderByColumn } from '../common/enums/enums';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Check if coupon with same code exists
    const existing = await this.couponRepository.findOne({
      where: { code: createCouponDto.code },
    });

    if (existing) {
      throw new ConflictException('Coupon with this code already exists');
    }

    // Create coupon data with proper types
    const couponData: Partial<Coupon> = {
      code: createCouponDto.code,
      type: createCouponDto.type,
      description: createCouponDto.description,
      amount: createCouponDto.amount,
      minimum_cart_amount: createCouponDto.minimum_cart_amount || 0,
      image: createCouponDto.image,
      active_from: createCouponDto.active_from,
      expire_at: createCouponDto.expire_at,
      target: createCouponDto.target || 0,
      shop_id: createCouponDto.shop_id,
      language: createCouponDto.language || 'en',
      translated_languages: [createCouponDto.language || 'en'],
      is_valid: true,
      is_approve: false,
    };

    const coupon = this.couponRepository.create(couponData);
    return this.couponRepository.save(coupon);
  }

  async getCoupons({
    page = 1,
    limit = 30,
    search,
    shop_id,
    language,
    orderBy = QueryCouponsOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetCouponsDto): Promise<CouponPaginator> {
    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    if (shop_id) {
      queryBuilder.andWhere('coupon.shop_id = :shop_id', { shop_id });
    }

    if (search) {
      const rawSearchParams = search.split(';').filter(Boolean);
      let searchCode: string | undefined;
      let searchDescription: string | undefined;
      const plainSearchTerms: string[] = [];

      for (const token of rawSearchParams) {
        const separatorIndex = token.indexOf(':');
        if (separatorIndex === -1) {
          plainSearchTerms.push(token.trim());
          continue;
        }

        const key = token.slice(0, separatorIndex).trim();
        const value = token.slice(separatorIndex + 1).trim();
        if (!value) {
          continue;
        }

        if (key === 'code') {
          searchCode = value;
        } else if (key === 'description') {
          searchDescription = value;
        } else {
          plainSearchTerms.push(value);
        }
      }

      if (searchCode) {
        queryBuilder.andWhere('coupon.code LIKE :searchCode', {
          searchCode: `%${searchCode}%`,
        });
      }

      if (searchDescription) {
        queryBuilder.andWhere('coupon.description LIKE :searchDescription', {
          searchDescription: `%${searchDescription}%`,
        });
      }

      if (plainSearchTerms.length) {
        const plainSearch = plainSearchTerms.join(' ');
        queryBuilder.andWhere(
          '(coupon.code LIKE :plainSearch OR coupon.description LIKE :plainSearch)',
          {
            plainSearch: `%${plainSearch}%`,
          },
        );
      }
    }

    if (language) {
      queryBuilder.andWhere(
        '(coupon.language = :language OR coupon.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    // Apply ordering
    const orderColumn =
      orderBy === QueryCouponsOrderByColumn.CODE
        ? 'coupon.code'
        : orderBy === QueryCouponsOrderByColumn.AMOUNT
        ? 'coupon.amount'
        : orderBy === QueryCouponsOrderByColumn.MINIMUM_CART_AMOUNT
        ? 'coupon.minimum_cart_amount'
        : orderBy === QueryCouponsOrderByColumn.EXPIRE_AT
        ? 'coupon.expire_at'
        : orderBy === QueryCouponsOrderByColumn.IS_APPROVE
        ? 'coupon.is_approve'
        : orderBy === QueryCouponsOrderByColumn.TYPE
        ? 'coupon.type'
        : 'coupon.created_at';

    const orderDirection =
      (sortedBy || SortOrder.DESC).toString().toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/coupons?limit=${limit}`;
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

  async getCoupon(param: string, language?: string): Promise<Coupon> {
    const isId = !isNaN(Number(param));

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon')
      .where(isId ? 'coupon.id = :id' : 'coupon.code = :code', {
        id: isId ? Number(param) : undefined,
        code: isId ? undefined : param,
      });

    if (language) {
      queryBuilder.andWhere(
        '(coupon.language = :language OR coupon.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    const coupon = await queryBuilder.getOne();

    if (!coupon) {
      throw new NotFoundException(
        `Coupon with ${isId ? 'ID' : 'code'} ${param} not found`,
      );
    }

    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    // Update fields
    if (updateCouponDto.code) {
      coupon.code = updateCouponDto.code;
    }

    if (updateCouponDto.type) {
      coupon.type = updateCouponDto.type;
    }

    if (updateCouponDto.description !== undefined) {
      coupon.description = updateCouponDto.description;
    }

    if (updateCouponDto.amount !== undefined) {
      coupon.amount = updateCouponDto.amount;
    }

    if (updateCouponDto.minimum_cart_amount !== undefined) {
      coupon.minimum_cart_amount = updateCouponDto.minimum_cart_amount;
    }

    if (updateCouponDto.image !== undefined) {
      coupon.image = updateCouponDto.image;
    }

    if (updateCouponDto.active_from) {
      coupon.active_from = updateCouponDto.active_from;
    }

    if (updateCouponDto.expire_at) {
      coupon.expire_at = updateCouponDto.expire_at;
    }

    if (updateCouponDto.target !== undefined) {
      coupon.target = updateCouponDto.target; // Now both are numbers
    }

    if (updateCouponDto.shop_id !== undefined) {
      coupon.shop_id = updateCouponDto.shop_id;
    }

    if (updateCouponDto.language) {
      coupon.language = updateCouponDto.language;
      if (!coupon.translated_languages.includes(updateCouponDto.language)) {
        coupon.translated_languages = [
          ...coupon.translated_languages,
          updateCouponDto.language,
        ];
      }
    }

    return this.couponRepository.save(coupon);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    await this.couponRepository.remove(coupon);

    return {
      success: true,
      message: `Coupon with ID ${id} deleted successfully`,
    };
  }

  async verifyCoupon(code: string): Promise<VerifyCouponResponse> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
    });

    if (!coupon) {
      return {
        is_valid: false,
        coupon: null,
      };
    }

    // Check if coupon is approved
    if (coupon.is_approve === false) {
      return {
        is_valid: false,
        coupon,
      };
    }

    // Check if coupon is valid
    if (!coupon.is_valid) {
      return {
        is_valid: false,
        coupon,
      };
    }

    // Check expiration
    const now = new Date();
    const activeFrom = new Date(coupon.active_from);
    const expireAt = new Date(coupon.expire_at);

    if (now < activeFrom || now > expireAt) {
      return {
        is_valid: false,
        coupon,
      };
    }

    return {
      is_valid: true,
      coupon,
    };
  }

  async approveCoupon(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    coupon.is_approve = true;
    return this.couponRepository.save(coupon);
  }

  async disapproveCoupon(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    coupon.is_approve = false;
    return this.couponRepository.save(coupon);
  }
}
