import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '../enums/PermissionType.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PermissionType[]) =>
  SetMetadata(ROLES_KEY, roles);
