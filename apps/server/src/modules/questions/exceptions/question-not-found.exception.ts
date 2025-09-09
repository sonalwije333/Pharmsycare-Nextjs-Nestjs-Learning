import { HttpException, HttpStatus } from '@nestjs/common';

export class QuestionNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Question with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}