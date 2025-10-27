import { FastifyReply, FastifyRequest } from 'fastify';
import AuthService, { LoginServiceResponse } from './services.js';
import { UserLogin, UserRegister } from './types.js';
import { errorResponse, successResponse } from '@utils/response.js';
import { logger } from '@utils/logger.js';
import { InvalidCredentialsError, InvalidTokenError, UserExistsError } from './errors.js';
import {
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '@utils/cookie.js';

class AuthHandler {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /*** Sets both the Access Token and Refresh Token cookies.*/
  private setAuthTokens(reply: FastifyReply, accessToken: string, refreshToken: string, isSecure: boolean): void {
    setRefreshTokenCookie(reply, refreshToken, isSecure);
    setAccessTokenCookie(reply, accessToken, isSecure);
  }

  /** * Clears both the Access Token and Refresh Token cookies.*/
  private clearAuthTokens(reply: FastifyReply): void {
    clearAccessTokenCookie(reply);
    clearRefreshTokenCookie(reply);
  }

  /** POST /register - Registration user */
  public register = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.body as UserRegister;
      const createdUser = await this.authService.register(user);

      return successResponse(reply, 201, 'User registered successfully', createdUser);
    } catch (error) {
      // Handle specific business errors
      if (error instanceof UserExistsError) {
        logger.warn({
          msg: 'User registration failed - user with credentials already exists',
          error: {
            message: error.message,
          },
        });
        return errorResponse(reply, 409, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error registering user',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** POST /login - Login user */
  public login = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.body as UserLogin;
      const { user: loggedInUser, refreshToken } = (await this.authService.login(user)) as LoginServiceResponse;

      // Determine if the connection is secure (essential for cookie flags)
      const isSecure = req.protocol === 'https';

      // 🔑 GENERATE ACCESS TOKEN AND SET THE COOKIES
      const accessToken = await req.server.auth.token(loggedInUser);
      this.setAuthTokens(reply, accessToken, refreshToken, isSecure);

      return successResponse(reply, 200, 'User logged in successfully', {
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      // Handle specific business errors
      if (error instanceof InvalidCredentialsError) {
        logger.warn({
          msg: 'User logged in failed - invalid email or password',
          error: {
            message: error.message,
          },
        });
        return errorResponse(reply, 401, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error logging in user',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** DELETE /logout - Logout user */
  public logout = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const refreshTokenValue = getRefreshToken(req);
      await this.authService.logout(refreshTokenValue);

      // 🗑️ Clear both cookies
      this.clearAuthTokens(reply);

      return successResponse(reply, 200, 'Logout successfull');
    } catch (error) {
      // 🗑️ Clear both cookies
      this.clearAuthTokens(reply);

      // Handle specific business errors
      if (error instanceof InvalidTokenError) {
        logger.warn({
          msg: 'Invalid Token Logout',
          error: {
            message: error.message,
          },
        });

        return errorResponse(reply, 401, error.message);
      }
      // Handle unexpected errors
      logger.error({
        msg: 'Error when logout user',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };

  /** POST /refresh - Exchange old Refresh Token for new Access/Refresh Tokens */
  public refresh = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const oldRefreshToken = getRefreshToken(req);
      if (!oldRefreshToken) {
        logger.warn('Token refresh failed: Refresh Token missing from request.');
        return errorResponse(reply, 401, 'Refresh Token is required.');
      }

      const { user, refreshToken } = (await this.authService.refresh(oldRefreshToken)) as LoginServiceResponse;

      // Determine if the connection is secure (essential for cookie flags)
      const isSecure = req.protocol === 'https';

      // 🔑 GENERATE NEW ACCESS TOKEN AND SET THE COOKIES
      const accessToken = await req.server.auth.token(user);
      this.setAuthTokens(reply, accessToken, refreshToken, isSecure);

      return successResponse(reply, 200, 'Tokens refreshed successfully', {
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      // wipe existing cookies to force full re-login
      this.clearAuthTokens(reply);

      // Handle specific business errors
      if (error instanceof InvalidTokenError) {
        logger.warn({
          msg: 'Invalid Token refresh',
          error: {
            message: error.message,
          },
        });

        return errorResponse(reply, 401, error.message);
      }

      // Handle unexpected errors
      logger.error({
        msg: 'Error when refresh token',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      return errorResponse(reply, 500, 'Internal Server Error');
    }
  };
}

export default AuthHandler;
