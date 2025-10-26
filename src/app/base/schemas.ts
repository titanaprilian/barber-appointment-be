import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
/* ---------------------------------------------
    Reusable Definitions
--------------------------------------------- */
export namespace Data {
  export const baseResponse = Type.Object({
    label: Type.Optional(Type.String()),
    uptime: Type.Optional(Type.Number()),
    version: Type.Optional(Type.String()),
    status: Type.Optional(
      Type.Object({
        rssBytes: Type.Optional(Type.Number()),
        heapUsed: Type.Optional(Type.Number()),
        eventLoopDelay: Type.Optional(Type.Number()),
        eventLoopUtilized: Type.Optional(Type.Number()),
      })
    ),
  });

  export const queueBody = Type.Object({
    action: Type.Union([Type.Literal('drain'), Type.Literal('clean'), Type.Literal('obliterate')]),
  });
}

/* ---------------------------------------------
    Fastify Route Schemas
--------------------------------------------- */
export namespace RouteSchema {
  /**
   * GET /
   * Health status of application.
   */
  export const base: FastifySchema = {
    response: { 200: Data.baseResponse },
  };
}
