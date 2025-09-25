import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Product with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
}