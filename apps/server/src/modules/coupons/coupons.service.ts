// src/modules/coupons/coupons.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { GetCouponsDto, CouponPaginator } from './dto/get-coupons.dto';
import { VerifyCouponInput, VerifyCouponResponse } from './dto/verify-coupon.dto';
import { paginate } from '../common/pagination/paginate';
import {QueryCouponsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private readonly couponRepository: Repository<Coupon>,
    ) {}

    async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
        // Check if coupon code already exists
        const existingCoupon = await this.couponRepository.findOne({
            where: { code: createCouponDto.code },
        });

        if (existingCoupon) {
            throw new NotFoundException(`Coupon with code ${createCouponDto.code} already exists`);
        }

        const coupon = this.couponRepository.create(createCouponDto);
        return await this.couponRepository.save(coupon);
    }

    async getCoupons({
                         page = 1,
                         limit = 30,
                         search,
                         orderBy = QueryCouponsOrderByColumn.CREATED_AT,
                         sortedBy = 'DESC',
                         shop_id,
                         language,
                         is_approve,
                     }: GetCouponsDto): Promise<CouponPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const where: FindOptionsWhere<Coupon> = {};

        if (search) {
            where.code = Like(`%${search}%`);
        }

        if (shop_id) {
            where.shop_id = shop_id;
        }

        if (language) {
            where.language = language;
        }

        if (is_approve !== undefined) {
            where.is_approve = is_approve === 'true';
        }

        const order = {};
        order[orderBy] = sortedBy;

        const [results, total] = await this.couponRepository.findAndCount({
            where,
            take,
            skip,
            order,
            relations: ['image', 'shop'],
        });

        const url = `/coupons?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    async getCoupon(param: string, language: string): Promise<Coupon> {
        const coupon = await this.couponRepository.findOne({
            where: [
                { id: parseInt(param) },
                { code: param }
            ],
            relations: ['image', 'shop'],
        });

        if (!coupon) {
            throw new NotFoundException(`Coupon with ID or code ${param} not found`);
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

        Object.assign(coupon, updateCouponDto);
        return await this.couponRepository.save(coupon);
    }

    async remove(id: number): Promise<void> {
        const coupon = await this.couponRepository.findOne({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException(`Coupon with ID ${id} not found`);
        }

        await this.couponRepository.remove(coupon);
    }

    async verifyCoupon(code: string): Promise<VerifyCouponResponse> {
        const currentDate = new Date();

        const coupon = await this.couponRepository.findOne({
            where: {
                code,
                is_valid: true,
                active_from: LessThanOrEqual(currentDate),
                expire_at: MoreThanOrEqual(currentDate),
            },
            relations: ['image'],
        });

        if (!coupon) {
            // return {
            //     is_valid: false,
            //     coupon: null,
            // };
            throw new NotFoundException('Invalid or expired coupon');
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
        return await this.couponRepository.save(coupon);
    }

    async disapproveCoupon(id: number): Promise<Coupon> {
        const coupon = await this.couponRepository.findOne({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException(`Coupon with ID ${id} not found`);
        }

        coupon.is_approve = false;
        return await this.couponRepository.save(coupon);
    }
}