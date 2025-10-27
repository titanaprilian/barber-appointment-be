import type { FastifyReply } from 'fastify';

export function successResponse(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  data: unknown = null,
  extras: Record<string, unknown> = {}
) {
  return reply.code(statusCode).send({
    error: false,
    code: statusCode,
    message,
    data,
    ...extras,
  });
}

export function errorResponse(reply: FastifyReply, statusCode: number, message: string, data: unknown = null) {
  return reply.code(statusCode).send({
    error: true,
    code: statusCode,
    message,
    data,
  });
}
