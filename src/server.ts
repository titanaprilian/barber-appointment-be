import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import type { Server } from 'node:http';
import closeWithGrace from 'close-with-grace';

import config from '@config/environment.js';
import jwt from '@plugins/jwt.js';
import { logger } from '@utils/logger.js';
import routes from 'routes.js';
import { loggerConfig } from '@config/logger.js';
import { randomUUID } from 'node:crypto';
import authorizationPlugin from '@plugins/authorizationPlugin.js';

/**
 * Creates and configures a Fastify server instance.
 */
const createServer = async (): Promise<FastifyInstance<Server>> => {
  const app = fastify({
    trustProxy: true,
    requestTimeout: 60_000,
    keepAliveTimeout: 60_000,
    logger: loggerConfig,
  });

  /**
   * ==========================
   *  Global Request Hooks
   * ==========================
   */

  // Log every incoming request with method, URL, and IP
  app.addHook('onRequest', async (request) => {
    const requestId = randomUUID();
    (request as any).id = requestId;
    (request as any).startTime = process.hrtime();

    logger.info({
      msg: `Incoming ${request.method} request`,
      requestId,
      url: request.url,
      ip: request.ip,
    });
  });

  // Log response details and calculate response time
  app.addHook('onResponse', async (request, reply) => {
    const startTime = (request as any).startTime;
    const requestId = (request as any).id;
    const [sec, nano] = process.hrtime(startTime);
    const responseTimeMs = (sec * 1e3 + nano * 1e-6).toFixed(2);

    logger.info({
      msg: 'Request completed',
      requestId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTimeMs}ms`,
    });
  });

  // Handle unexpected errors
  app.addHook('onError', async (request, reply, error) => {
    const requestId = (request as any).id;

    logger.error({
      msg: 'Unhandled request error',
      requestId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  });

  /**
   * ==========================
   *  CORS Configuration
   * ==========================
   */
  if (config.isDevEnvironment && Array.isArray(config.cors.origin)) {
    // Allow localhost in development for easier testing
    config.cors.origin.push(/localhost(:\d{1,5})?/);
  }

  /**
   * ==========================
   *  Plugin Registration
   * ==========================
   */
  await app
    .register(import('@fastify/cors'), config.cors)
    .register(import('@fastify/cookie'))
    .register(import('@fastify/formbody'))
    .register(import('@fastify/under-pressure'), config.healthcheck)
    .register(jwt, { global: true })
    .register(authorizationPlugin, { global: true });

  // Database and API documentation setup based on environment
  if (config.isDevEnvironment) {
    app.log.info('db: development');
    await app
      .register(import('@fastify/swagger'), config.swagger)
      .register(import('@fastify/swagger-ui'), config.swaggerUI);
  } else {
    app.log.info('db: production');
    logger.info('Production environment detected, skipping Swagger registration');
  }

  /**
   * ==========================
   *  Application Routes
   * ==========================
   */
  await app.register(routes);

  /**
   * ==========================
   *  Graceful Shutdown Handler
   * ==========================
   */
  const closeListeners = closeWithGrace({ delay: 2000 }, async ({ signal, err }) => {
    logger.info(`Graceful shutdown initiated by signal: ${signal}`);

    if (err) {
      app.log.error(err);
    }

    await app.close();
    logger.info('Server closed gracefully.');
  });

  app.addHook('onClose', async () => {
    closeListeners.uninstall();
    logger.info('Shutdown cleanup completed.');
  });

  await app.ready();
  return app;
};

/**
 * ==========================
 *  Server Bootstrap
 * ==========================
 */
const startServer = async (): Promise<void> => {
  try {
    const app = await createServer();
    const { host, port, isDevEnvironment } = config;

    await app.listen({ port: Number(port), host });

    logger.info({
      msg: '🚀 Server started successfully',
      environment: isDevEnvironment ? 'development' : 'production',
      address: `http://${host}:${port}`,
      timestamp: new Date().toISOString(),
    });

    // You can also log via Fastify’s internal logger
    app.log.info(`Server listening at http://${host}:${port}`);
  } catch (error) {
    logger.error({
      msg: '❌ Failed to start server',
      error: {
        message: (error as Error).message,
        stack: (error as Error).stack,
      },
    });
    process.exit(1);
  }
};

// Bootstrap the application
await startServer();
