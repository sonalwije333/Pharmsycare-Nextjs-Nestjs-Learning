// src/modules/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/role.decorator';
import { PermissionType } from '../../enums/PermissionType.enum';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PermissionType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('Required roles:', requiredRoles);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    console.log('User from request:', user); // Debug the user object

    if (!user) {
      throw new ForbiddenException('Access denied - no user found');
    }

    // Check if permissions exist
    if (!user.permissions) {
      console.log('No permissions found in user object');
      throw new ForbiddenException('Access denied - no user permissions found');
    }

    const hasRole = requiredRoles.some((role) =>
      user.permissions.includes(role),
    );

    console.log('User has required role:', hasRole);
    console.log('User permissions:', user.permissions);
    console.log('Required roles:', requiredRoles);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied - required roles: ${requiredRoles.join(', ')}, user has: ${user.permissions.join(', ')}`,
      );
    }

    return true;
  }
}
