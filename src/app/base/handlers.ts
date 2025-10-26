import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
class BaseHandler {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * GET /base - Returns API welcome info along with memory usage.
   */
  public base = async (request: FastifyRequest, reply: FastifyReply) => {
    const status = this.fastify.memoryUsage();
    reply.code(200);
    return {
      label: 'Welcome to API_BARBER V1',
      uptime: process.uptime(),
      version: process.version,
      status,
    };
  };
}

export default BaseHandler;
