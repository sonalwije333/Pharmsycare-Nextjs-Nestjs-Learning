import { HttpException, HttpStatus } from '@nestjs/common';

export class FlashSaleNotFoundException extends HttpException {
    constructor(identifier: string) {
        super(`Flash sale with ID or slug ${identifier} not found`, HttpStatus.NOT_FOUND);
    }
}