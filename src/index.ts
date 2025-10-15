import type { Server } from 'http';
import app from './app';
import config from './config/env';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongo';
import logger from './utils/logger';

let server: Server | undefined;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase();
    server = app.listen(config.app.port, () => {
      if (server) {
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
      }
      logger.info('Server is running', {
        port: config.app.port,
        environment: config.app.env,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

const closeServer = async (): Promise<void> => {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server?.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.warn(`Received ${signal}, shutting down gracefully.`);

  try {
    await closeServer();
    await disconnectFromDatabase();
    logger.info('Shutdown complete.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGQUIT', () => shutdown('SIGQUIT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  shutdown('unhandledRejection');
});

void startServer();
