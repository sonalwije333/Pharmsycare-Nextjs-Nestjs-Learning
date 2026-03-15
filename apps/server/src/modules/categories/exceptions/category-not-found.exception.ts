import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryNotFoundException extends HttpException {
  constructor(identifier: string | number) {
    const message =
      typeof identifier === 'number'
        ? `Category with ID ${identifier} not found`
        : `Category with slug "${identifier}" not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class CategoryHasChildrenException extends HttpException {
  constructor(id: number) {
    super(
      `Category with ID ${id} has child categories and cannot be deleted`,
      HttpStatus.CONFLICT,
    );
  }
}

export class CategoryTypeNotFoundException extends HttpException {
  constructor(typeId: string) {
    super(`Type with ID ${typeId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class CategoryParentNotFoundException extends HttpException {
  constructor(parentId: string) {
    super(
      `Parent category with ID ${parentId} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
