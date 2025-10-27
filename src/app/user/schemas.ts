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
  export const userUpdateProfileBody = Type.Object({
    name: Type.Optional(
      Type.String({
        description: 'The name of the user',
      })
    ),
    email: Type.Optional(
      Type.String({
        format: 'email',
        description: 'The email of the user',
      })
    ),
    phone: Type.Optional(
      Type.String({
        description: 'The phone number of the user',
      })
    ),
  });

  export const userUpdatePasswordBody = Type.Object({
    oldPassword: Type.String({
      description: 'The old password of the user',
    }),
    newPassword: Type.String({
      description: 'The new password of the user',
    }),
  });

  /* ---------------------------------------------
        Response Body Schemas
    --------------------------------------------- */
  export const userProfileResponse = Type.Object({
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
   * * GET /v1/users/me
   */
  export const getUser: FastifySchema = {
    description: 'Get current logged in user data',
    tags: ['user'],
    response: {
      200: replyObj(Data.userProfileResponse),
      ...errorResponses,
    },
  };

  /**
   * * PUT /v1/users/me
   */
  export const updateUser: FastifySchema = {
    description: 'Update current logged in user data',
    tags: ['user'],
    body: Data.userUpdateProfileBody,
    response: {
      200: replyObj(Data.userProfileResponse),
      ...errorResponses,
    },
  };

  /**
   * * PUT /v1/users/change-password
   */
  export const changePassword: FastifySchema = {
    description: 'Update current logged in user password',
    tags: ['user'],
    body: Data.userUpdatePasswordBody,
    response: {
      200: replyObj(null),
      ...errorResponses,
    },
  };
}
