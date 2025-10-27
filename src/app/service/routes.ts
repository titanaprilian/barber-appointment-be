import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import ServiceRepository from './repositories.js';
import db from 'database.js';
import ServiceService from './services.js';
import ServiceHandler from './handlers.js';
import { RouteSchema } from './schemas.js';

const routes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const repository = new ServiceRepository(db as any);
  const service = new ServiceService(repository);
  const handler = new ServiceHandler(service);

  /* ---------------------------------------------
    Register Route
    --------------------------------------------- */
  app.route({
    method: 'GET',
    url: '/',
    schema: RouteSchema.getServicesList,
    preHandler: [app.authenticate, app.authorize(['customer', 'admin', 'barber'])],
    handler: handler.getAllServices,
  });

  app.route({
    method: 'GET',
    url: '/:id',
    schema: RouteSchema.getServiceById,
    preHandler: [app.authenticate, app.authorize(['customer', 'admin', 'barber'])],
    handler: handler.getServiceById,
  });

  app.route({
    method: 'POST',
    url: '/',
    schema: RouteSchema.createService,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.createService,
  });

  app.route({
    method: 'PUT',
    url: '/:id',
    schema: RouteSchema.updateServiceById,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.updateService,
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    schema: RouteSchema.deleteServiceById,
    preHandler: [app.authenticate, app.authorize(['admin'])],
    handler: handler.deleteService,
  });
};

export default routes;
