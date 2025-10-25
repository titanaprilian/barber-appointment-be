import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Create a pino logger with file + console outputs
export const logger = pino({
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      // Pretty console output for development
      {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true,
        },
      },
      // File output for persistence
      {
        target: 'pino/file',
        options: {
          destination: path.join(logDir, 'app.log'),
          mkdir: true,
          append: true,
        },
      },
    ],
  },
});
