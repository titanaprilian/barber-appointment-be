import fs from 'fs';
import path from 'path';
import { errorResponse, successResponse } from '@utils/response.js';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const LOG_PATH = path.resolve('./logs/app.log');

const routes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // logger.info
  app.get('/logs', async (req, reply) => {
    try {
      if (!fs.existsSync(LOG_PATH)) {
        return successResponse(reply, 200, 'No logs found', []);
      }

      const logLines = fs
        .readFileSync(LOG_PATH, 'utf-8')
        .split('\n')
        .filter(Boolean) // remove empty lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line }; // fallback if parse fails
          }
        });

      return successResponse(reply, 200, 'Logs Retrieved Successfully', logLines);
    } catch (err) {
      return errorResponse(reply, 500, 'Failed to retrieve logs', err as Error);
    }
  });
};

export default routes;
