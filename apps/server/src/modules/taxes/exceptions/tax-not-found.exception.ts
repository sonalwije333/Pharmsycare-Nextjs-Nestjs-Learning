import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Tax with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}