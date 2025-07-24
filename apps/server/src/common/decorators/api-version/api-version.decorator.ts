import { SetMetadata } from '@nestjs/common';

export const ApiVersion = (...args: string[]) => SetMetadata('api-version', args);
