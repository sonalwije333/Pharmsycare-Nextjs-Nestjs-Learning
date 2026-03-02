import { HttpException, HttpStatus } from '@nestjs/common';

export class ShippingNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Shipping with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class ShippingNameExistsException extends HttpException {
  constructor(name: string) {
    super(`Shipping with name "${name}" already exists`, HttpStatus.CONFLICT);
  }
}
