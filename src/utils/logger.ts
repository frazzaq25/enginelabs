import { createLogger, format, transports } from 'winston';
import config from '../config/env';

const { combine, timestamp, errors, splat, json, colorize, printf } = format;

const consoleFormat = config.app.env === 'development'
  ? combine(
      colorize({ all: true }),
      printf(({ level, message, timestamp: ts, stack, ...meta }) => {
        const base = `${ts} [${level}]: ${stack || message}`;
        const metadata = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `${base}${metadata}`;
      })
    )
  : combine(json());

const logger = createLogger({
  level: config.logging.level,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), splat()),
  defaultMeta: { service: config.app.name },
  transports: [
    new transports.Console({
      format: consoleFormat,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

export default logger;
