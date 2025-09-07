import { HttpException, HttpStatus } from '@nestjs/common';

export class FaqNotFoundException extends HttpException {
    constructor(identifier: string) {
        super(`FAQ with ID or slug ${identifier} not found`, HttpStatus.NOT_FOUND);
    }
}