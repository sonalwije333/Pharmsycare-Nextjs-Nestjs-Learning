import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`Order with ID or tracking number ${identifier} not found`, HttpStatus.NOT_FOUND);
  }
}

export class OrderStatusNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`Order status with ID or slug ${identifier} not found`, HttpStatus.NOT_FOUND);
  }
}