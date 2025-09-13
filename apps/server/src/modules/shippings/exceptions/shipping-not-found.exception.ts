import { HttpException, HttpStatus } from '@nestjs/common';

export class ShippingNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Shipping with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}