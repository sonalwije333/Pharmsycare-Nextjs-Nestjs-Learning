// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Permission[]) => SetMetadata(ROLES_KEY, roles);