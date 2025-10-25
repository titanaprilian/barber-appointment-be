import type { FastifyReply, FastifyRequest } from 'fastify';

const COOKIE_NAME = process.env.COOKIE_NAME || 'session_token';

export function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 60 * 60 * 24,
  });
}

export function getAuthToken(req: FastifyRequest): string | undefined {
  // 1. Get from the cookie first
  const cookieToken = req.cookies[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  // 2. Get from authorization header if cookie is not present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  return undefined;
}

export function clearAuthCookie(reply: FastifyReply) {
  reply.setCookie(COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    expires: new Date(0),
    maxAge: 0,
  });
}
