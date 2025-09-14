import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {GetTaxesDto} from "./dto/get-taxes.dto";
import {SortOrder} from "../common/dto/generic-conditions.dto";
import {QueryTaxClassesOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class TaxesService {
    constructor(
        @InjectRepository(Tax)
        private readonly taxRepository: Repository<Tax>,
    ) {}

    async create(createTaxDto: CreateTaxDto): Promise<Tax> {
        const tax = this.taxRepository.create(createTaxDto);
        return await this.taxRepository.save(tax);
    }

    async findAll(getTaxesDto: GetTaxesDto): Promise<Tax[]> {
        const { text, orderBy, sortedBy = SortOrder.ASC } = getTaxesDto;

        const where = text ? { name: Like(`%${text}%`) } : {};

        let order = {};
        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            order[column] = sortedBy;
        } else {
            order = { created_at: SortOrder.DESC };
        }

        return this.taxRepository.find({
            where,
            order,
        });
    }

    private getOrderByColumn(orderBy: QueryTaxClassesOrderByColumn): string {
        switch (orderBy) {
            case QueryTaxClassesOrderByColumn.NAME:
                return 'name';
            case QueryTaxClassesOrderByColumn.RATE:
                return 'rate';
            case QueryTaxClassesOrderByColumn.COUNTRY:
                return 'country';
            case QueryTaxClassesOrderByColumn.STATE:
                return 'state';
            case QueryTaxClassesOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryTaxClassesOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findOne(id: number): Promise<Tax> {
        const tax = await this.taxRepository.findOne({
            where: { id },
        });

        if (!tax) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }

        return tax;
    }

    async update(id: number, updateTaxDto: UpdateTaxDto): Promise<Tax> {
        const tax = await this.taxRepository.findOneBy({ id });

        if (!tax) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }

        const updated = this.taxRepository.merge(tax, updateTaxDto);
        return this.taxRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const tax = await this.taxRepository.findOneBy({ id });

        if (!tax) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }

        await this.taxRepository.remove(tax);
    }
}