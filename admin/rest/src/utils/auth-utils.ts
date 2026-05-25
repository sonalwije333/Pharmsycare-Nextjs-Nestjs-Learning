import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import {
  AUTH_CRED,
  EMAIL_VERIFIED,
  PERMISSIONS,
  STAFF,
  STORE_OWNER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';

export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER];
export const ownerAndStaffOnly = [STORE_OWNER, STAFF];

/** Cookie key used for auth — must match NEXT_PUBLIC_AUTH_TOKEN_KEY when set. */
export function getAuthCookieKey(): string {
  return process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? AUTH_CRED;
}

export function getBearerToken(context?: any): string | null {
  const authCred = context
    ? parseSSRCookie(context)[getAuthCookieKey()]
    : Cookie.get(getAuthCookieKey());

  if (!authCred) {
    return null;
  }

  try {
    const parsed = JSON.parse(authCred);
    return parsed?.token ?? null;
  } catch {
    // Support raw JWT string stored directly in the cookie.
    return authCred;
  }
}

export function setAuthCredentials(token: string, permissions: any, role: any) {
  Cookie.set(getAuthCookieKey(), JSON.stringify({ token, permissions, role }));
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
    authCred = parseSSRCookie(context)[getAuthCookieKey()];
  } else {
    authCred = Cookie.get(getAuthCookieKey());
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

export function isAuthenticated(_cookies: any) {
  return (
    !!_cookies[TOKEN] &&
    Array.isArray(_cookies[PERMISSIONS]) &&
    !!_cookies[PERMISSIONS].length
  );
}
