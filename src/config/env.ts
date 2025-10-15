import dotenv from 'dotenv';

dotenv.config();

type NodeEnvironment = 'development' | 'test' | 'production' | 'staging';

const normalizePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsedPort = parseInt(value, 10);
  return Number.isFinite(parsedPort) ? parsedPort : fallback;
};

const nodeEnv = (process.env.NODE_ENV as NodeEnvironment) || 'development';

const config = {
  app: {
    name: process.env.APP_NAME || 'secure-express-backend',
    env: nodeEnv,
    port: normalizePort(process.env.PORT, 3000),
  },
  mongo: {
    uri: process.env.MONGO_URI || '',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  logging: {
    level: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  },
};

export type AppConfig = typeof config;

export default config;
