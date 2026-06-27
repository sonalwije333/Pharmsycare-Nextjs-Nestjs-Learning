import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import {
  AUTH_CRED,
  EMAIL_VERIFIED,
  PERMISSIONS,
  STAFF,
  BRANCH_OWNER,
  SUPPLIER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';

export const allowedRoles = [SUPER_ADMIN, BRANCH_OWNER, STAFF, SUPPLIER];
export const adminAndOwnerOnly = [SUPER_ADMIN, BRANCH_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, BRANCH_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [BRANCH_OWNER];
export const ownerAndStaffOnly = [BRANCH_OWNER, STAFF];
export const supplierOnly = [SUPPLIER];
export const adminOwnerStaffSupplier = [SUPER_ADMIN, BRANCH_OWNER, STAFF, SUPPLIER];

export function setAuthCredentials(token: string, permissions: any, role: any) {
  Cookie.set(AUTH_CRED, JSON.stringify({ token, permissions, role }));
}
export function setEmailVerified(emailVerified: boolean) {
  Cookie.set(EMAIL_VERIFIED, JSON.stringify({ emailVerified }));
}
export function getEmailVerified(): {
  emailVerified: boolean;
} {
  const emailVerified = Cookie.get(EMAIL_VERIFIED);
  return emailVerified ? JSON.parse(emailVerified) : false;
}

export function getAuthCredentials(context?: any): {
  token: string | null;
  permissions: string[] | null;
  role: string | null;
} {
  let authCred;
  if (context) {
    authCred = parseSSRCookie(context)[AUTH_CRED];
  } else {
    authCred = Cookie.get(AUTH_CRED);
  }
  if (authCred) {
    return JSON.parse(authCred);
  }
  return { token: null, permissions: null, role: null };
}

export function parseSSRCookie(context: any) {
  return SSRCookie.parse(context.req.headers.cookie ?? '');
}

export function hasAccess(
  _allowedRoles: string[],
  _userPermissions: string[] | undefined | null,
) {
  if (_userPermissions) {
    return Boolean(
      _allowedRoles?.find((aRole) => _userPermissions.includes(aRole)),
    );
  }
  return false;
}

/**
 * Decides whether a sidebar/menu entry should be shown for the current user.
 *
 * Rules:
 * - Super admins can see everything.
 * - An entry that declares `permission`/`permissions` is hidden unless the user
 *   has at least one of those roles.
 * - An entry without any role requirement is visible by default.
 * - A parent entry (one that has a `childMenu`) is only visible when at least
 *   one of its (recursively resolved) children is visible, so we never render
 *   empty groups.
 */
export function isMenuItemVisible(
  menuItem: any,
  userPermissions: string[] | undefined | null,
): boolean {
  if (Array.isArray(userPermissions) && userPermissions.includes(SUPER_ADMIN)) {
    return true;
  }

  const requiredRoles = menuItem?.permission ?? menuItem?.permissions;
  if (requiredRoles && !hasAccess(requiredRoles, userPermissions)) {
    return false;
  }

  const children = Array.isArray(menuItem?.childMenu)
    ? menuItem.childMenu
    : [];
  if (children.length > 0) {
    return children.some((child: any) =>
      isMenuItemVisible(child, userPermissions),
    );
  }

  return true;
}

export function isAuthenticated(_cookies: any) {
  return (
    !!_cookies[TOKEN] &&
    Array.isArray(_cookies[PERMISSIONS]) &&
    !!_cookies[PERMISSIONS].length
  );
}
