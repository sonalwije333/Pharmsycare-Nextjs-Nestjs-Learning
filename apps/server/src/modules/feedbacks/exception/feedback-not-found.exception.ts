import { HttpException, HttpStatus } from '@nestjs/common';

export class FeedbackNotFoundException extends HttpException {
    constructor(id: string) {
        super(`Feedback with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}