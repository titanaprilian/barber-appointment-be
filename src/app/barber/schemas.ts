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
  export const barberBody = Type.Object({
    id: Type.Number({ description: 'Unique identifier of the barber', examples: [101] }),
    name: Type.String({ description: 'Full name of the barber', examples: ['Squidward Tentacles'] }),
    email: Type.String({
      format: 'email',
      description: 'The email address of the barber (used for login)',
      examples: ['squidward@krustykrab.com'],
    }),
    password: Type.String({ description: 'The hashed password of the barber', examples: ['$2a$10$abcdef...'] }),
    role: Type.String({ description: 'The role of the user (should be "barber")' }),
    phone: Type.String({ description: 'The contact phone number', examples: ['081234567890'] }),
  });

  /* ---------------------------------------------
        Request Body Schemas
    --------------------------------------------- */
  export const postBarberBody = Type.Object({
    name: Type.String({ description: 'Full name of the new barber', examples: ['SpongeBob SquarePants'] }),
    email: Type.String({
      format: 'email',
      description: 'The email address of the new barber',
      examples: ['spongebob@krustykrab.com'],
    }),
    password: Type.String({
      description: 'The plain text password for the new barber account',
      examples: ['i<3krabbypatties'],
    }),
    phone: Type.String({ description: 'The contact phone number', examples: ['089876543210'] }),
  });

  export const updateBarberBody = Type.Object({
    name: Type.Optional(Type.String({ description: 'New full name of the barber', examples: ['Mr. Krabs'] })),
    email: Type.Optional(
      Type.String({
        format: 'email',
        description: 'New email address of the barber',
        examples: ['krabs@krustykrab.com'],
      })
    ),
    password: Type.Optional(
      Type.String({ description: 'New plain text password (will be hashed)', examples: ['new_secret_krab'] })
    ),
    phone: Type.Optional(Type.String({ description: 'New contact phone number', examples: ['080011223344'] })),
  });

  /* ---------------------------------------------
        Response Body Schemas
    --------------------------------------------- */
  export const getBarberResponse = Type.Object({
    id: Type.Number({ description: 'Unique identifier of the barber', examples: [205] }),
    name: Type.String({ description: 'Full name of the barber', examples: ['Sandy Cheeks'] }),
    email: Type.String({ format: 'email', description: 'The email address', examples: ['sandy@treedome.com'] }),
    role: Type.String({ description: 'The user role', examples: ['barber'] }),
    phone: Type.String({ description: 'The contact phone number', examples: ['087755331100'] }),
  });

  /* ---------------------------------------------
        Parameter Schemas
    --------------------------------------------- */
  export const barberParams = Type.Object({
    id: Type.Number({ description: 'The ID of the barber' }),
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
   * * POST /v1/barbers/
   */
  export const createBarber: FastifySchema = {
    description: 'Create new barber',
    tags: ['barber'],
    body: Data.postBarberBody,
    response: {
      201: replyObj(Data.getBarberResponse),
      ...errorResponses,
    },
  };

  /**
   * * GET /v1/barbers/
   */
  export const getBarbersList: FastifySchema = {
    description: 'Get list of barbers',
    tags: ['barber'],
    response: {
      200: replyObj(Type.Array(Data.getBarberResponse)),
      ...errorResponses,
    },
  };

  /**
   * * GET /v1/barbers/:id
   */
  export const getBarberById: FastifySchema = {
    description: 'Get barber by id',
    tags: ['barber'],
    params: Data.barberParams,
    response: {
      200: replyObj(Data.getBarberResponse),
      ...errorResponses,
    },
  };

  /**
   * * PUT /v1/barbers/:id
   */
  export const updateBarberById: FastifySchema = {
    description: 'Update barber by id',
    tags: ['barber'],
    params: Data.barberParams,
    body: Data.updateBarberBody,
    response: {
      200: replyObj(Data.getBarberResponse),
      ...errorResponses,
    },
  };

  /**
   * * DELETE /v1/barbers/:id
   */
  export const deleteBarberById: FastifySchema = {
    description: 'Delete barber by id',
    tags: ['barber'],
    params: Data.barberParams,
    response: {
      200: replyObj(null),
      ...errorResponses,
    },
  };
}
