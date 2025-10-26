import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthService from '@app/auth/services.js';
import { UserExistsError, InvalidCredentialsError, InvalidTokenError } from '@app/auth/errors.js';

// Mock bcrypt module and export the mock functions from the factory so we can use them in tests.
vi.mock('bcryptjs', () => {
  const mockHash = vi.fn().mockResolvedValue('hashed_password');
  const mockCompare = vi.fn();
  return {
    __esModule: true,
    default: {
      hash: mockHash,
      compare: mockCompare,
    },
    // also export them as named exports for easy access in tests
    mockHash,
    mockCompare,
  };
});

import bcrypt from 'bcryptjs';
// the mocked module exposes the mock functions on the default import's properties
const mockHash = (bcrypt as any).hash as ReturnType<typeof vi.fn>;
const mockCompare = (bcrypt as any).compare as ReturnType<typeof vi.fn>;

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findByEmail: vi.fn(),
      findByName: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      createRefreshToken: vi.fn(),
      findValidRefreshToken: vi.fn(),
      deleteRefreshToken: vi.fn(),
    };
    service = new AuthService(mockRepository);
  });

  describe('register', () => {
    const validUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      phone: '1234567890',
    };

    it('should successfully register a new user', async () => {
      // Setup mocks to indicate no existing users
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.findByPhone.mockResolvedValue(null);

      const createdUser = {
        id: 1,
        ...validUser,
        password: 'hashed_password',
        role: 'user',
      };
      mockRepository.create.mockResolvedValue(createdUser);

      const result = await service.register(validUser);

      // Verify the result doesn't include password
      expect(result).toEqual({
        id: 1,
        email: validUser.email,
        name: validUser.name,
        phone: validUser.phone,
        role: 'user',
      });

      // Verify all repository methods were called correctly
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(validUser.email);
      expect(mockRepository.findByName).toHaveBeenCalledWith(validUser.name);
      expect(mockRepository.findByPhone).toHaveBeenCalledWith(validUser.phone);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...validUser,
        password: 'hashed_password',
      });
      expect(mockHash).toHaveBeenCalledWith(validUser.password, 10);
    });

    it('should throw UserExistsError when email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue({ id: 1, email: validUser.email });
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.findByPhone.mockResolvedValue(null);

      await expect(service.register(validUser)).rejects.toThrow(
        new UserExistsError('User with this email already exists.')
      );
    });

    it('should throw UserExistsError when name already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByName.mockResolvedValue({ id: 1, name: validUser.name });
      mockRepository.findByPhone.mockResolvedValue(null);

      await expect(service.register(validUser)).rejects.toThrow(
        new UserExistsError('User with this username already exists.')
      );
    });

    it('should throw UserExistsError when phone already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.findByPhone.mockResolvedValue({ id: 1, phone: validUser.phone });

      await expect(service.register(validUser)).rejects.toThrow(
        new UserExistsError('User with this phone number already exists.')
      );
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const existingUser = {
        id: 1,
        email: validCredentials.email,
        password: 'hashed_password',
        name: 'Test User',
        phone: '1234567890',
        role: 'user',
      };

      mockRepository.findByEmail.mockResolvedValue(existingUser);
      mockCompare.mockResolvedValue(true);
      mockRepository.createRefreshToken.mockResolvedValue('new_refresh_token');

      const result = await service.login(validCredentials);

      expect(result).toEqual({
        user: {
          id: 1,
          email: existingUser.email,
          name: existingUser.name,
          phone: existingUser.phone,
          role: existingUser.role,
        },
        refreshToken: 'new_refresh_token',
      });
    });

    it('should throw InvalidCredentialsError when email not found', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(validCredentials)).rejects.toThrow(
        new InvalidCredentialsError('Invalid email or password.')
      );
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      mockRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: validCredentials.email,
        password: 'hashed_password',
      });
      mockCompare.mockResolvedValue(false);

      await expect(service.login(validCredentials)).rejects.toThrow(
        new InvalidCredentialsError('Invalid email or password.')
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      mockRepository.deleteRefreshToken.mockResolvedValue(true);
      await expect(service.logout('valid_refresh_token')).resolves.toBeUndefined();
      expect(mockRepository.deleteRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
    });

    it('should throw InvalidTokenError when refresh token is missing', async () => {
      await expect(service.logout(undefined)).rejects.toThrow(new InvalidTokenError('Refresh token is missing.'));
    });

    it('should throw InvalidTokenError when refresh token is invalid', async () => {
      mockRepository.deleteRefreshToken.mockResolvedValue(false);

      await expect(service.logout('invalid_token')).rejects.toThrow(
        new InvalidTokenError('Refresh token is not valid.')
      );
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens', async () => {
      const tokenRecord = { user_id: 1 };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        phone: '1234567890',
        role: 'user',
      };

      mockRepository.findValidRefreshToken.mockResolvedValue(tokenRecord);
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.createRefreshToken.mockResolvedValue('new_refresh_token');

      const result = await service.refresh('valid_old_token');

      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        refreshToken: 'new_refresh_token',
      });

      expect(mockRepository.deleteRefreshToken).toHaveBeenCalledWith('valid_old_token');
    });

    it('should throw InvalidTokenError when refresh token is invalid', async () => {
      mockRepository.findValidRefreshToken.mockResolvedValue(null);

      await expect(service.refresh('invalid_token')).rejects.toThrow(
        new InvalidTokenError('Invalid or expired refresh token.')
      );
    });

    it('should throw InvalidTokenError when user not found', async () => {
      mockRepository.findValidRefreshToken.mockResolvedValue({ user_id: 1 });
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.refresh('valid_token')).rejects.toThrow(
        new InvalidTokenError('User associated with token not found.')
      );
    });
  });
});
