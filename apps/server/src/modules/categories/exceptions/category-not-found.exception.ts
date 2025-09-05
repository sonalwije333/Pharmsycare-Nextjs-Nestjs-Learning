// src/modules/categories/exceptions/category-not-found.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryNotFoundException extends HttpException {
    constructor(identifier: string) {
        super(`Category with ID or slug ${identifier} not found`, HttpStatus.NOT_FOUND);
    }
}