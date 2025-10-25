/* ----------------------------------------------------------------------------
 * Configuration Interfaces
 * -------------------------------------------------------------------------- */

import { FastifyCorsOptions } from '@fastify/cors';

interface AppConfig {
  host: string;
  port: number;
  isDevEnvironment: boolean;
  cors: FastifyCorsOptions;
}

/* ----------------------------------------------------------------------------
 * Environment Parsing Helpers
 * -------------------------------------------------------------------------- */
const parseNumber = (value: string | undefined, defaultValue: number): number => (value ? Number(value) : defaultValue);

/* ----------------------------------------------------------------------------
 * Configuration Object
 * -------------------------------------------------------------------------- */

const config: AppConfig = {
  host: process.env.HOST || 'localhost',
  port: parseNumber(process.env.PORT, 3000),
  isDevEnvironment: process.env.NODE_ENV !== 'production',
  cors: {
    origin: ['http://localhost:3000', 'https://sincarebunch.my.id'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Origin',
      'User-Agent',
      'X-Requested-With',
      'If-Modified-Since',
      'Cache-Control',
      'Range',
      'set-cookie',
      'Pragma',
      'Expires',
    ],
    credentials: true,
  },
};

export default config;
