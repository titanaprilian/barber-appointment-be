import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import AuthHandler from '@app/auth/handlers.js';
import AuthService from '@app/auth/services.js';
import { UserExistsError } from '@app/auth/errors.js';
import { UserRegister } from '@app/auth/types.js';

interface MockFastifyReply {
  statusCode: number;
  payload: any;
  code: (code: number) => MockFastifyReply;
  send: (payload: any) => MockFastifyReply;
}

const mockReply = (): MockFastifyReply => {
  const reply = {
    statusCode: 0,
    payload: null,
    code(code: number) {
      this.statusCode = code;
      return this;
    },
    send(payload: any) {
      this.payload = payload;
      return this;
    },
  };
  return reply;
};

const createMockAuthService = () => {
  return {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    repository: {} as any,
  } as unknown as AuthService;
};

const createMockRequest = (body: any): Partial<FastifyRequest> => {
  return {
    body,
    id: 'test-id',
    params: {},
    query: {},
    headers: {},
    raw: {} as any,
    server: {} as any,
    log: {} as any,
  };
};

describe('AuthHandler.register', () => {
  let handler: AuthHandler;
  let service: AuthService;
  let validRegisterData: UserRegister;

  beforeEach(() => {
    service = createMockAuthService() as AuthService;
    handler = new AuthHandler(service);
    validRegisterData = {
      name: 'Titan',
      email: 'a@b.com',
      password: 'securepass123',
      phone: '1234567890',
    };
  });

  it('should return 201 when registration successful', async () => {
    const fakeUser = {
      id: 1,
      name: validRegisterData.name,
      email: validRegisterData.email,
      phone: validRegisterData.phone,
      role: 'user',
    };
    vi.mocked(service.register).mockResolvedValue(fakeUser);

    const req = createMockRequest(validRegisterData) as FastifyRequest;
    const reply = mockReply() as unknown as FastifyReply;

    await handler.register(req, reply);

    expect(service.register).toHaveBeenCalledWith(validRegisterData);
    expect(reply.statusCode).toBe(201);
    expect((reply as unknown as MockFastifyReply).payload.message).toBe('User registered successfully');
    expect((reply as unknown as MockFastifyReply).payload.data).toEqual(fakeUser);
  });

  it('should return 409 when user already exists', async () => {
    const errorMessage = 'User with this email already exists';
    vi.mocked(service.register).mockRejectedValue(new UserExistsError(errorMessage));

    const req = createMockRequest(validRegisterData) as FastifyRequest;
    const reply = mockReply() as unknown as FastifyReply;

    await handler.register(req, reply);

    expect(service.register).toHaveBeenCalledWith(validRegisterData);
    expect(reply.statusCode).toBe(409);
    expect((reply as unknown as MockFastifyReply).payload.error).toBe(true);
    expect((reply as unknown as MockFastifyReply).payload.message).toBe(errorMessage);
  });

  it('should return 500 on unexpected errors', async () => {
    const unexpectedError = new Error('Database connection failed');
    vi.mocked(service.register).mockRejectedValue(unexpectedError);

    const req = createMockRequest(validRegisterData) as FastifyRequest;
    const reply = mockReply() as unknown as FastifyReply;

    await handler.register(req, reply);

    expect(reply.statusCode).toBe(500);
    expect((reply as unknown as MockFastifyReply).payload.error).toBe(true);
    expect((reply as unknown as MockFastifyReply).payload.message).toBe('Internal Server Error');
  });
});
