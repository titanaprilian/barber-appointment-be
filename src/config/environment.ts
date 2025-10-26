/* ----------------------------------------------------------------------------
 * Configuration Interfaces
 * -------------------------------------------------------------------------- */

import { FastifyCorsOptions } from '@fastify/cors';
import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { FastifyUnderPressureOptions } from '@fastify/under-pressure';
import { FastifyInstance } from 'fastify';

interface AppConfig {
  host: string;
  port: number;
  isDevEnvironment: boolean;
  cors: FastifyCorsOptions;
  healthcheck: FastifyUnderPressureOptions;
  swagger: SwaggerOptions;
  swaggerUI: FastifySwaggerUiOptions;
}

/* ----------------------------------------------------------------------------
 * Environment Parsing Helpers
 * -------------------------------------------------------------------------- */
const parseNumber = (value: string | undefined, defaultValue: number): number => (value ? Number(value) : defaultValue);

/* ----------------------------------------------------------------------------
 * Configuration Object
 * -------------------------------------------------------------------------- */

const config: AppConfig = {
  host: process.env.HOST || 'localhost',
  port: parseNumber(process.env.PORT, 3000),
  isDevEnvironment: process.env.NODE_ENV !== 'production',
  cors: {
    origin: ['http://localhost:3000', 'https://sincarebunch.my.id'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Origin',
      'User-Agent',
      'X-Requested-With',
      'If-Modified-Since',
      'Cache-Control',
      'Range',
      'set-cookie',
      'Pragma',
      'Expires',
    ],
    credentials: true,
  },
  healthcheck: {
    maxEventLoopDelay: 1000,
    maxEventLoopUtilization: 0.9,
    message: 'Server under pressure!',
    retryAfter: 60,
    exposeStatusRoute: {
      routeOpts: {},
      routeResponseSchemaOpts: {
        metrics: {
          type: 'object',
          properties: {
            eventLoopDelay: { type: 'number' },
            eventLoopUtilized: { type: 'number' },
            rssBytes: { type: 'number' },
            heapUsed: { type: 'number' },
          },
        },
      },
    },
    healthCheck: async (app: FastifyInstance) => ({
      metrics: app.memoryUsage(),
    }),
  },
  swagger: {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'FastifyStarter',
        description: 'Starter swagger API',
        version: '0.1.0',
      },
      servers: [
        {
          url: process.env.HOST || 'http://localhost:4000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'base', description: 'Root end-points' },
        { name: 'gallery', description: 'Gallery related end-points' },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
        },
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
    },
  },
  swaggerUI: {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      displayRequestDuration: true,
    },
    uiHooks: {
      onRequest: (request, reply, next) => {
        next();
      },
      preHandler: (request, reply, next) => {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, req, reply) => {
      const updatedSwaggerObject = { ...swaggerObject, host: req.hostname };
      return updatedSwaggerObject;
    },
    transformSpecificationClone: true,
  },
};

export default config;
