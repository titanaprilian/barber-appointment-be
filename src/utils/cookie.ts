import type { FastifyReply, FastifyRequest } from 'fastify';

const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setAccessTokenCookie(reply: FastifyReply, token: string, secure: boolean) {
  reply.setCookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: secure,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(reply: FastifyReply, token: string, secure: boolean) {
  reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: secure,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function getAccessToken(req: FastifyRequest): string | undefined {
  // 1. Get from the cookie first
  const cookieToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  // 2. Get from authorization header if cookie is not present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  return undefined;
}

export function getRefreshToken(req: FastifyRequest): string | undefined {
  // 1. Get from the cookie first
  const cookieToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Get from authorization header if cookie is not present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  return undefined;
}

export function clearAccessTokenCookie(reply: FastifyReply) {
  reply.setCookie(ACCESS_TOKEN_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
  });
}

/** Clears the Refresh Token cookie. */
export function clearRefreshTokenCookie(reply: FastifyReply) {
  reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
  });
}
