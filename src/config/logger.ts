import path from 'path';

export const loggerConfig = {
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true,
        },
      },
      {
        target: 'pino/file',
        options: {
          destination: path.resolve('logs/app.log'),
          mkdir: true,
          append: true,
        },
      },
    ],
  },
};
