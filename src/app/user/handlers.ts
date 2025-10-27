import { FastifyReply, FastifyRequest } from 'fastify';
import UserService from './services.js';
import { errorResponse, successResponse } from '@utils/response.js';
import { logger } from '@utils/logger.js';
import { UserUpdatePasswordBody, UserUpdateProfileBody } from './types.js';
import { InvalidCredentialsError, UserExistsError } from '@app/auth/errors.js';
import { UserNotExistsError } from './errors.js';

class UserHandler {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /** GET /me - Get current user information */
  public getUser = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = req.user.id as number;
      const currentUser = await this.userService.getProfile(userId);

      return successResponse(reply, 200, 'Successfully get the user information', currentUser);
    } catch (error) {
      // Handle unexpected errors
      logger.error({
        msg: 'Error get user information',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** PUT /me - Update current user information */
  public updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = req.user.id as number;
      const userData = req.body as UserUpdateProfileBody;

      const updateUser = await this.userService.updateProfile(userId, userData);

      return successResponse(reply, 200, 'Successfully update the user information', updateUser);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof UserExistsError) {
        logger.warn({
          msg: 'User update information failed - user with credentials already exists',
          error: {
            message: error.message,
          },
        });

        return errorResponse(reply, 409, error.message);
      }

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

  /**
   * * PUT /change-password - Change current user's password
   */
  public changePassword = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user.id as number;
    const { oldPassword, newPassword } = req.body as UserUpdatePasswordBody;

    try {
      await this.userService.changePassword(userId, oldPassword, newPassword);
      return successResponse(reply, 200, 'Password updated successfully');
    } catch (error) {
      // Handle specific business errors
      if (error instanceof UserNotExistsError) {
        logger.warn({
          msg: 'User is not exist',
        });
        return errorResponse(reply, 401, error.message);
      }

      if (error instanceof InvalidCredentialsError) {
        logger.warn({
          msg: 'Password change failed - Incorrect old password',
        });
        return errorResponse(reply, 401, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: `Error changing password for user ${userId}`,
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };
}

export default UserHandler;
