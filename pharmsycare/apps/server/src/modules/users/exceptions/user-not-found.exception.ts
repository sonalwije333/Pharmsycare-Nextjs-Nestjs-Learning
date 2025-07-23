import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: number) {
    super(`User with id ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}
