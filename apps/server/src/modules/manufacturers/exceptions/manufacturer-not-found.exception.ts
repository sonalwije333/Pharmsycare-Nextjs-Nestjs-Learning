import { HttpException, HttpStatus } from '@nestjs/common';

export class ManufacturerNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Manufacturer with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}
