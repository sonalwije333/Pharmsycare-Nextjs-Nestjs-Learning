import { HttpException, HttpStatus } from '@nestjs/common';

export class ManufacturerNotFoundException extends HttpException {
    constructor(identifier: string) {
        super(`Manufacturer with ID or slug ${identifier} not found`, HttpStatus.NOT_FOUND);
    }
}