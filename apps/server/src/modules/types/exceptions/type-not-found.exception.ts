import { HttpException, HttpStatus } from '@nestjs/common';

export class TypeNotFoundException extends HttpException {
  constructor(identifier: string | number) {
    const message =
      typeof identifier === 'number'
        ? `Type with ID ${identifier} not found`
        : `Type with slug ${identifier} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}
