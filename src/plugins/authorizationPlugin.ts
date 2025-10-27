import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// Define the roles (should match your User type)
type Role = 'customer' | 'admin' | 'barber';

// We need to define this utility type because the JWT payload is attached to req.user
// by your existing 'fast-jwt' plugin's declaration merge.
interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

// ----------------------------------------------------
// Plugin Function
// ----------------------------------------------------
async function authorizationPlugin(app: FastifyInstance) {
  // ----------------------------------------------------
  // Authorization Utility (Role Check preHandler)
  // ----------------------------------------------------
  /**
   * Creates a preHandler function that checks if the authenticated user's role
   * is included in the list of allowed roles.
   */
  const authorize = (allowedRoles: Role[]) => async (req: FastifyRequest, reply: FastifyReply) => {
    // req.user is guaranteed to be present here if 'app.authenticate' ran successfully before this.
    const userRole = (req.user as AuthenticatedUser).role;

    if (!allowedRoles.includes(userRole)) {
      reply.code(403).send({
        error: true,
        message: 'Forbidden: Insufficient privileges.',
      });
      throw new Error('Forbidden: Insufficient privileges.'); // Stops execution chain
    }
    // If role is allowed, execution continues to the route handler.
  };

  // Decorate the instance to make the authorize helper available
  app.decorate('authorize', authorize);
}

declare module 'fastify' {
  interface FastifyInstance {
    authorize: (allowedRoles: Role[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Export as a Fastify Plugin, ensuring it runs after JWT is set up
export default fp(authorizationPlugin, {
  name: 'authorization-roles',
  dependencies: ['fast-jwt'], // Ensure it runs after your JWT plugin
});

// ----------------------------------------------------
// NOTE: You must also update your existing 'authenticated' function
// in your fastJWT plugin to handle token retrieval (cookies/header).
// ----------------------------------------------------
