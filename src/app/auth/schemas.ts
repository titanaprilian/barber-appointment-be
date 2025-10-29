import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { replyErrorObj, replyObj } from '@config/schemas.js';

/* ---------------------------------------------
    Reusable Definitions
--------------------------------------------- */

export namespace Data {
  /* ---------------------------------------------
        Data Schemas
    --------------------------------------------- */
  export const userBody = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    role: Type.String(),
    phone: Type.String(),
  });

  /* ---------------------------------------------
        Request Body Schemas
    --------------------------------------------- */
  export const userLoginBody = Type.Object({
    email: Type.String(),
    password: Type.String(),
  });

  export const userRegisterBody = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    phone: Type.String(),
  });

  /* ---------------------------------------------
        Response Body Schemas
    --------------------------------------------- */
  export const userLoginResponse = Type.Object({
    accessToken: Type.String(),
    refreshToken: Type.String(),
  });

  export const userRegisterResponse = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    role: Type.String(),
    phone: Type.String(),
  });
}

/* ---------------------------------------------
    Shared Error Responses
--------------------------------------------- */
const errorResponses = {
  400: replyErrorObj,
  401: replyErrorObj,
  404: replyErrorObj,
  409: replyErrorObj,
  500: replyErrorObj,
};

/* ---------------------------------------------
    Fastify Route Schemas
--------------------------------------------- */
export namespace RouteSchema {
  /**
   * * POST /v1/auth/register
   */
  export const register: FastifySchema = {
    description: 'Register new user',
    tags: ['auth'],
    body: Data.userRegisterBody,
    response: {
      200: replyObj(Data.userRegisterResponse),
      ...errorResponses,
    },
  };

  /**
   * * POST /v1/auth/login
   */
  export const login: FastifySchema = {
    description: 'Login existing user',
    tags: ['auth'],
    body: Data.userLoginBody,
    response: {
      200: replyObj(Data.userLoginResponse),
      ...errorResponses,
    },
  };

  /**
   * * POST /v1/auth/logout
   */
  export const logout: FastifySchema = {
    description: 'Logout user',
    tags: ['auth'],
    response: {
      200: replyObj(null),
      ...errorResponses,
    },
  };

  /**
   * * POST /v1/auth/logout
   */
  export const refresh: FastifySchema = {
    description: 'Refresh user token',
    tags: ['auth'],
    response: {
      200: replyObj(Data.userLoginResponse),
      ...errorResponses,
    },
  };
}
