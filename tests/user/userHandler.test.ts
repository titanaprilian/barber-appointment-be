import UserHandler from '@app/user/handlers.js';
import UserService from '@app/user/services.js';
import { FastifyRequest } from 'fastify';
import { beforeEach, describe } from 'node:test';
import { vi } from 'vitest';

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

const createMockUserService = () => {
  return {
    getProfile: vi.fn(),
  } as unknown as UserService;
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

describe('UserHandler.getProfile', () => {
  let handler: UserHandler;
  let service: UserService;

  beforeEach(() => {
    service = createMockUserService() as UserService;
    handler = new UserHandler(service);
    validRegisterData = {
      name: 'Titan',
      email: 'a@b.com',
      password: 'securepass123',
      phone: '1234567890',
    };
  });
});
