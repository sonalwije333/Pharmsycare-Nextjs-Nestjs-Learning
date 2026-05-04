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
import { GetCouponsDto, CouponPaginator } from './dto/get-coupons.dto';
import { VerifyCouponResponse } from './dto/verify-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { CouponOrderByColumn } from 'src/common/enums/coupon-type.enum';
import { Attachment } from 'src/common/entities/attachment.entity';


@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepository.findOne({
      where: { code: createCouponDto.code },
    });

    if (existing) {
      throw new ConflictException('Coupon with this code already exists');
    }

    const couponData: Partial<Coupon> = {
      code: createCouponDto.code,
      type: createCouponDto.type,
      description: createCouponDto.description,
      amount: createCouponDto.amount,
      minimum_cart_amount: createCouponDto.minimum_cart_amount || 0,
      image: this.normalizeAttachment(createCouponDto.image),
      active_from: createCouponDto.active_from,
      expire_at: createCouponDto.expire_at,
      target: createCouponDto.target || 0,
      shop_id: createCouponDto.shop_id,
      user_id: createCouponDto.user_id,
      language: createCouponDto.language || 'en',
      translated_languages: [createCouponDto.language || 'en'],
      is_valid: true,
      is_approve: false,
    };

    const coupon = this.couponRepository.create(couponData);
    return this.couponRepository.save(coupon);
  }

  async findAll({
    page = 1,
    limit = 30,
    search,
    shop_id,
    language,
    is_approve,
    orderBy = CouponOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetCouponsDto): Promise<CouponPaginator> {
    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    if (shop_id) {
      queryBuilder.andWhere('coupon.shop_id = :shop_id', { shop_id });
    }

    if (is_approve !== undefined) {
      queryBuilder.andWhere('coupon.is_approve = :is_approve', { is_approve });
    }

    if (search) {
      queryBuilder.andWhere(
        'coupon.code LIKE :search OR coupon.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (language) {
      queryBuilder.andWhere(
        '(coupon.language = :language OR coupon.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case CouponOrderByColumn.CODE:
        orderColumn = 'coupon.code';
        break;
      case CouponOrderByColumn.AMOUNT:
        orderColumn = 'coupon.amount';
        break;
      case CouponOrderByColumn.MINIMUM_CART_AMOUNT:
        orderColumn = 'coupon.minimum_cart_amount';
        break;
      case CouponOrderByColumn.EXPIRE_AT:
        orderColumn = 'coupon.expire_at';
        break;
      case CouponOrderByColumn.IS_APPROVE:
        orderColumn = 'coupon.is_approve';
        break;
      case CouponOrderByColumn.TYPE:
        orderColumn = 'coupon.type';
        break;
      default:
        orderColumn = 'coupon.created_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
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

  async findOne(param: string, language?: string): Promise<Coupon> {
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

    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existing = await this.couponRepository.findOne({
        where: { code: updateCouponDto.code },
      });
      if (existing) {
        throw new ConflictException('Coupon with this code already exists');
      }
      coupon.code = updateCouponDto.code;
    }

    if (updateCouponDto.type !== undefined) {
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
      coupon.image = this.normalizeAttachment(updateCouponDto.image);
    }

    if (updateCouponDto.active_from) {
      coupon.active_from = updateCouponDto.active_from;
    }

    if (updateCouponDto.expire_at) {
      coupon.expire_at = updateCouponDto.expire_at;
    }

    if (updateCouponDto.target !== undefined) {
      coupon.target = updateCouponDto.target;
    }

    if (updateCouponDto.shop_id !== undefined) {
      coupon.shop_id = updateCouponDto.shop_id;
    }

    if (updateCouponDto.user_id !== undefined) {
      coupon.user_id = updateCouponDto.user_id;
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

    await this.couponRepository.softDelete(id);

    return {
      success: true,
      message: `Coupon with ID ${id} deleted successfully`,
    };
  }

  async verify(code: string): Promise<VerifyCouponResponse> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
    });

    if (!coupon) {
      return {
        is_valid: false,
        coupon: null,
      };
    }

    if (coupon.is_approve === false) {
      return {
        is_valid: false,
        coupon,
      };
    }

    if (!coupon.is_valid) {
      return {
        is_valid: false,
        coupon,
      };
    }

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

  async approve(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    coupon.is_approve = true;
    return this.couponRepository.save(coupon);
  }

  async disapprove(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    coupon.is_approve = false;
    return this.couponRepository.save(coupon);
  }

  private normalizeAttachment(
    image?: Record<string, string>,
  ): Attachment | undefined {
    if (!image) {
      return undefined;
    }

    return image as unknown as Attachment;
  }
}