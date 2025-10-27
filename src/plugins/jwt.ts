import fastifyJwt from '@fastify/jwt';
import { getAccessToken } from '@utils/cookie.js';
import { errorResponse } from '@utils/response.js';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * * All JWT features including roles
 */
async function fastJWT(app: FastifyInstance) {
  /**
   * * prime256v1, in short P-256 ECDSA keys for JWT
   */
  app.register(fastifyJwt, {
    secret: {
      private: readFileSync(join(__dirname, '..', '..', 'certs', 'private.pem')),
      public: readFileSync(join(__dirname, '..', '..', 'certs', 'public.pem')),
    },
    sign: { algorithm: 'ES256' },
  });

  /**
   * * generate token for authorization
   */
  const token = async (user: User) =>
    app.jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      { expiresIn: '60m' }
    );

  /**
   * * check if logged in
   */
  const authenticated = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = getAccessToken(req);
      if (!token) {
        return errorResponse(reply, 401, 'Token is missing');
      }

      req.headers.authorization = `Bearer ${token}`;
      await req.jwtVerify();
    } catch (error) {
      return errorResponse(reply, 401, 'Unauthorized: Invalid or expired token');
    }
  };

  app.decorate('authenticate', authenticated);

  app.decorate('auth', {
    token,
  });
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: User;
    user: User;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    auth: {
      token: (user: User) => Promise<string>;
    };
  }
}

export default fp(fastJWT, {
  fastify: '>=5.0.0',
  name: 'fast-jwt',
});
