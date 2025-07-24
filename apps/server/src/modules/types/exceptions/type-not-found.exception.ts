import { HttpException, HttpStatus } from '@nestjs/common';

export class TypeNotFoundException extends HttpException {
  constructor(slug: string) {
    super(`Type with slug ${slug} not found`, HttpStatus.NOT_FOUND);
  }
}
