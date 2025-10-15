import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import compression from 'compression';
import expressWinston from 'express-winston';
import config from './config/env';
import logger from './utils/logger';
import healthcheckRouter from './routes/healthcheck';

const app: Application = express();

app.disable('x-powered-by');

const configuredOrigins = config.cors.origin
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const allowAllOrigins =
  config.cors.origin === '*' || configuredOrigins.length === 0 || configuredOrigins.includes('*');

const corsOptions: CorsOptions = allowAllOrigins
  ? { origin: true, credentials: config.cors.credentials }
  : { origin: configuredOrigins, credentials: config.cors.credentials };

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}',
    expressFormat: false,
    colorize: false,
    ignoreRoute: (req) => req.path === '/health',
  })
);

app.use('/health', healthcheckRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
  });
});

app.use(expressWinston.errorLogger({
  winstonInstance: logger,
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  const responseBody = {
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : err.message,
  };

  if (statusCode >= 500) {
    logger.error('Unhandled error', { error: err });
  }

  res.status(statusCode).json(responseBody);
});

export default app;
