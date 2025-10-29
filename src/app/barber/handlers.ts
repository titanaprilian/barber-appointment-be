import { errorResponse, successResponse } from '@utils/response.js';
import BarberService from './services.js';
import { logger } from '@utils/logger.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UserNotExistsError } from '@app/user/errors.js';
import { BarberBody, BarberUpdateBody } from './types.js';
import { UserExistsError } from '@app/auth/errors.js';

class BarberHandler {
  private barberService: BarberService;

  constructor(barberService: BarberService) {
    this.barberService = barberService;
  }

  /** GET /barbers - Get list of barbers */

  public getAllBarbers = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const barbers = await this.barberService.getAll();

      return successResponse(reply, 200, 'Barbers fetched successfully', barbers);
    } catch (error) {
      // Handle unexpected errors
      logger.error({
        msg: 'Error fetching all barbers',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** GET /barbers/:id - Get barber by id */
  public getBarberById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const barberId = (req.params as { id: string }).id;
      const id = parseInt(barberId);

      const barber = await this.barberService.getById(id);

      return successResponse(reply, 200, 'Barber fetched successfully', barber);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof UserNotExistsError) {
        logger.warn({
          msg: 'Barber is not exist',
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

  /** POST /barbers - Create a new barber */
  public createBarber = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const barberData = req.body as BarberBody;
      const newBarber = await this.barberService.create(barberData);

      return successResponse(reply, 201, 'Barber created successfully', newBarber);
    } catch (error) {
      // Catch duplicate user errors
      if (error instanceof UserExistsError) {
        logger.warn({ msg: 'Barber creation failed - credentials conflict', error: { message: error.message } });
        return errorResponse(reply, 409, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error create user information',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** PUT /barbers/:id - Update a barber by id */
  public updateBarber = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const barberId = (req.params as { id: string }).id;
      const id = parseInt(barberId);
      const updates = req.body as BarberUpdateBody;

      const updatedBarber = await this.barberService.update(id, updates);

      return successResponse(reply, 200, 'Service updated successfully', updatedBarber);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof UserNotExistsError) {
        logger.warn({
          msg: 'Barber is not exist',
        });
        return errorResponse(reply, 404, error.message);
      }

      if (error instanceof UserExistsError) {
        logger.warn({ msg: 'Barber update failed - credentials conflict', error: { message: error.message } });
        return errorResponse(reply, 409, error.message); // 409 Conflict
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

  /** DELETE /barber/:id - Delete a barbers by id */
  public deleteService = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const barberId = (req.params as { id: string }).id;
      const id = parseInt(barberId);

      await this.barberService.delete(id);

      return successResponse(reply, 200, 'barber deleted successfully', null);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof UserNotExistsError) {
        logger.warn({
          msg: 'Barber is not exist',
        });
        return errorResponse(reply, 404, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error deleting barber',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };
}

export default BarberHandler;
