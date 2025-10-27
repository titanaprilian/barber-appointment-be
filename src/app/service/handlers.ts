import { errorResponse, successResponse } from '@utils/response.js';
import ServiceService from './services.js';
import { ServiceBody, UpdateServiceBody } from './types.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@utils/logger.js';
import { ServiceNotExistsError } from './errors.js';

class ServiceHandler {
  private serviceService: ServiceService;

  constructor(serviceService: ServiceService) {
    this.serviceService = serviceService;
  }

  /** GET /services - Get list of services */
  public getAllServices = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const services = await this.serviceService.getAll();

      return successResponse(reply, 200, 'Services fetched successfully', services);
    } catch (error) {
      // Handle unexpected errors
      logger.error({
        msg: 'Error fetching all services',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** GET /services/:id - Get service by id */
  public getServiceById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const serviceId = (req.params as { id: string }).id;
      const id = parseInt(serviceId);

      const service = await this.serviceService.getById(id);

      return successResponse(reply, 200, 'Service fetched successfully', service);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof ServiceNotExistsError) {
        logger.warn({
          msg: 'Service is not exist',
        });
        return errorResponse(reply, 404, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error fetching all services',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** POST /services - Create a new services */
  public createService = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const serviceData = req.body as ServiceBody;
      const newService = await this.serviceService.create(serviceData);

      return successResponse(reply, 201, 'Service created successfully', newService);
    } catch (error) {
      // Handle unexpected errors
      logger.error({
        msg: 'Error update user information',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** PUT /services/:id - Update a services by id */
  public updateService = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const serviceId = (req.params as { id: string }).id;
      const id = parseInt(serviceId);
      const updates = req.body as UpdateServiceBody;

      const updatedService = await this.serviceService.update(id, updates);

      return successResponse(reply, 200, 'Service updated successfully', updatedService);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof ServiceNotExistsError) {
        logger.warn({
          msg: 'Service is not exist',
        });
        return errorResponse(reply, 404, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error fetching all services',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** DELETE /services/:id - Delete a services by id */
  public deleteService = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const serviceId = (req.params as { id: string }).id;
      const id = parseInt(serviceId);

      await this.serviceService.delete(id);

      return successResponse(reply, 200, 'Service deleted successfully', null);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof ServiceNotExistsError) {
        logger.warn({
          msg: 'Service is not exist',
        });
        return errorResponse(reply, 404, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error fetching all services',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };
}

export default ServiceHandler;
