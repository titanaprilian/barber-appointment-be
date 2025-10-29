import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import BarberRepository from './repositories.js';
import db from 'database.js';
import BarberService from './services.js';
import BarberHandler from './handlers.js';
import { RouteSchema } from './schemas.js';

const routes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const repository = new BarberRepository(db as any);
  const service = new BarberService(repository);
  const handler = new BarberHandler(service);

  /* ---------------------------------------------
    Register Route
    --------------------------------------------- */
  app.route({
    method: 'GET',
    url: '/',
    schema: RouteSchema.getBarbersList,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.getAllBarbers,
  });

  app.route({
    method: 'GET',
    url: '/:id',
    schema: RouteSchema.getBarberById,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.getBarberById,
  });

  app.route({
    method: 'POST',
    url: '/',
    schema: RouteSchema.createBarber,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.createBarber,
  });

  app.route({
    method: 'PUT',
    url: '/:id',
    schema: RouteSchema.updateBarberById,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.updateBarber,
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    schema: RouteSchema.deleteBarberById,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.deleteService,
  });
};

export default routes;
