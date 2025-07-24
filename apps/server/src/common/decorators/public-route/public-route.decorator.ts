import { SetMetadata } from '@nestjs/common';

export const PublicRoute = (...args: string[]) => SetMetadata('public-route', args);
