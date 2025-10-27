import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { replyErrorObj, replyObj } from '@config/schemas.js';

/* ---------------------------------------------
    Reusable Definitions
--------------------------------------------- */

export namespace Data {
  /* ---------------------------------------------
        Request Body Schemas
    --------------------------------------------- */
  export const postServiceBody = Type.Object({
    name: Type.String({
      description: 'Name of the service',
      examples: ['Haircut', 'Beard Trim', 'Hair Coloring'],
      minLength: 1,
      maxLength: 100,
    }),
    duration: Type.Number({
      description: 'Duration of the service in minutes',
      examples: [30, 45, 60],
      minimum: 5,
      maximum: 480, // 8 hours max
    }),
    price: Type.Number({
      description: 'Price of the service in the smallest currency unit (e.g., cents)',
      examples: [2500, 3000, 15000], // $25.00, $30.00, $150.00
      minimum: 0,
    }),
    description: Type.String({
      description: 'Detailed description of the service',
      examples: ["Classic men's haircut includes washing, cutting, and styling"],
      minLength: 1,
      maxLength: 500,
    }),
  });

  export const updateServiceBody = Type.Object({
    name: Type.Optional(
      Type.String({
        description: 'Name of the service',
        examples: ['Haircut', 'Beard Trim', 'Hair Coloring'],
        minLength: 1,
        maxLength: 100,
      })
    ),
    duration: Type.Optional(
      Type.Number({
        description: 'Duration of the service in minutes',
        examples: [30, 45, 60],
        minimum: 5,
        maximum: 480, // 8 hours max
      })
    ),
    price: Type.Optional(
      Type.Number({
        description: 'Price of the service in the smallest currency unit (e.g., cents)',
        examples: [2500, 3000, 15000],
        minimum: 0,
      })
    ),
    description: Type.Optional(
      Type.String({
        description: 'Detailed description of the service',
        examples: ["Classic men's haircut includes washing, cutting, and styling"],
        minLength: 1,
        maxLength: 500,
      })
    ),
  });

  /* ---------------------------------------------
        Response Body Schemas
    --------------------------------------------- */
  export const getServiceResponse = Type.Object({
    id: Type.Number({
      description: 'Unique identifier for the service',
      examples: [1, 2, 3],
    }),
    name: Type.String({
      description: 'Name of the service',
      examples: ['Haircut', 'Beard Trim', 'Hair Coloring'],
      minLength: 1,
      maxLength: 100,
    }),
    duration: Type.Number({
      description: 'Duration of the service in minutes',
      examples: [30, 45, 60],
      minimum: 5,
      maximum: 480,
    }),
    price: Type.Number({
      description: 'Price of the service in the smallest currency unit (e.g., cents)',
      examples: [2500, 3000, 15000], // $25.00, $30.00, $150.00
      minimum: 0,
    }),
    description: Type.String({
      description: 'Detailed description of the service',
      examples: ["Classic men's haircut includes washing, cutting, and styling"],
      minLength: 1,
      maxLength: 500,
    }),
  });

  /* ---------------------------------------------
        Parameter Schemas
    --------------------------------------------- */
  export const serviceParams = Type.Object({
    id: Type.Number({ description: 'The ID of the service' }),
  });
}

/* ---------------------------------------------
    Shared Error Responses
--------------------------------------------- */
const errorResponses = {
  400: replyErrorObj,
  401: replyErrorObj,
  404: replyErrorObj,
  500: replyErrorObj,
};

/* ---------------------------------------------
    Fastify Route Schemas
--------------------------------------------- */
export namespace RouteSchema {
  /**
   * * POST /v1/services/
   */
  export const createService: FastifySchema = {
    description: 'Create new service',
    tags: ['service'],
    body: Data.postServiceBody,
    response: {
      201: replyObj(Data.getServiceResponse),
      ...errorResponses,
    },
  };

  /**
   * * GET /v1/services/
   */
  export const getServicesList: FastifySchema = {
    description: 'Get list of services',
    tags: ['service'],
    response: {
      200: replyObj(Type.Array(Data.getServiceResponse)),
      ...errorResponses,
    },
  };

  /**
   * * GET /v1/services/:id
   */
  export const getServiceById: FastifySchema = {
    description: 'Get service by id',
    tags: ['service'],
    params: Data.serviceParams,
    response: {
      200: replyObj(Data.getServiceResponse),
      ...errorResponses,
    },
  };

  /**
   * * PUT /v1/services/:id
   */
  export const updateServiceById: FastifySchema = {
    description: 'Update service by id',
    tags: ['service'],
    params: Data.serviceParams,
    body: Data.updateServiceBody,
    response: {
      200: replyObj(Data.getServiceResponse),
      ...errorResponses,
    },
  };

  /**
   * * DELETE /v1/services/:id
   */
  export const deleteServiceById: FastifySchema = {
    description: 'Delete service by id',
    tags: ['service'],
    params: Data.serviceParams,
    response: {
      200: replyObj(null),
      ...errorResponses,
    },
  };
}
