import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Category with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}
