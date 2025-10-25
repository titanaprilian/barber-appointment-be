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

/**
 * Send response to the client
 *
 * @param reply - Fastify reply object
 * @param statusCode - HTTP status code
 * @param message - Response message
 * @param data - Additional data to send
 */
export function errorResponse(reply: FastifyReply, statusCode: number, message: string, data: unknown = null) {
  return reply.code(statusCode).send({
    error: true,
    code: statusCode,
    message,
    data,
  });
}
