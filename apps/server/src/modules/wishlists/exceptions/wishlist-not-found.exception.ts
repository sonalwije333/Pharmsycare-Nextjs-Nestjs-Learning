import { HttpException, HttpStatus } from '@nestjs/common';

export class WishlistNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Wishlist with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}