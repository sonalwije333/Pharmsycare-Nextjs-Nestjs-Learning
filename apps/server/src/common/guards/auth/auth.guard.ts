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

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions) {
      throw new ForbiddenException('Access denied - no user permissions found');
    }

    const hasRole = requiredRoles.some((role) =>
      user.permissions.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied - required roles: ${requiredRoles.join(', ')}, user has: ${user.permissions.join(', ')}`,
      );
    }

    return true;
  }
}
