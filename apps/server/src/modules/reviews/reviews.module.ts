import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Report } from './entities/reports.entity';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';

import { User } from '../users/entities/user.entity';
import {Shop} from "../shops/entites/shop.entity";
import {ReviewController} from "./reviews.controller";
import {AbusiveReportsController} from "./reports.controller";
import {ReviewService} from "./reviews.service";
import {AbusiveReportService} from "./reports.service";



@Module({
    imports: [TypeOrmModule.forFeature([
        Report,
        Review,
        Product,
        Shop,
        //Order,
        User
    ])],
    controllers: [ReviewController, AbusiveReportsController],
    providers: [ReviewService, AbusiveReportService],
    exports: [ReviewService, AbusiveReportService],
})
export class ReviewModule {}