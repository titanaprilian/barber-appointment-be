import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import BaseHandler from './handlers.js';
import { RouteSchema } from './schemas.js';

const routes: FastifyPluginAsync = async (app: FastifyInstance, opts: FastifyPluginOptions) => {
  const baseHandler = new BaseHandler(app);
  /* ---------------------------------------------
    Base Routes
    --------------------------------------------- */
  app.route({
    method: 'GET',
    url: '/',
    schema: RouteSchema.base,
    handler: baseHandler.base,
  });
};

export default routes;
