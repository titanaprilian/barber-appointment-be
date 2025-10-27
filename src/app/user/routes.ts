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
    method: 'GET',
    url: '/me',
    schema: RouteSchema.getUser,
    preHandler: [app.authenticate, app.authorize(['customer', 'admin', 'barber'])],
    handler: handler.getUser,
  });

  app.route({
    method: 'PUT',
    url: '/me',
    schema: RouteSchema.updateUser,
    preHandler: [app.authenticate, app.authorize(['customer', 'admin', 'barber'])],
    handler: handler.updateUser,
  });

  app.route({
    method: 'PUT',
    url: '/change-password',
    schema: RouteSchema.changePassword,
    preHandler: [app.authenticate, app.authorize(['customer', 'admin', 'barber'])],
    handler: handler.changePassword,
  });
};

export default routes;
