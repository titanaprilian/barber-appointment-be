import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import AuthRepository from './repositories.js';
import db from 'database.js';
import AuthService from './services.js';
import AuthHandler from './handlers.js';
import { RouteSchema } from './schemas.js';

const routes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const repository = new AuthRepository(db as any);
  const service = new AuthService(repository);
  const handler = new AuthHandler(service);

  /* ---------------------------------------------
    Register Route
    --------------------------------------------- */
  app.route({
    method: 'POST',
    url: '/register',
    schema: RouteSchema.register,
    handler: handler.register,
  });

  app.route({
    method: 'POST',
    url: '/login',
    schema: RouteSchema.login,
    handler: handler.login,
  });

  app.route({
    method: 'DELETE',
    url: '/logout',
    schema: RouteSchema.logout,
    handler: handler.logout,
  });

  app.route({
    method: 'POST',
    url: '/refresh',
    schema: RouteSchema.refresh,
    handler: handler.refresh,
  });
};

export default routes;
