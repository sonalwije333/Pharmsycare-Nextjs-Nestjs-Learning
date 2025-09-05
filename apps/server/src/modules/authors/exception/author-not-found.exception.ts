import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorNotFoundException extends HttpException {
    constructor(identifier: string) {
        super(`Author with ID or slug ${identifier} not found`, HttpStatus.NOT_FOUND);
    }
}