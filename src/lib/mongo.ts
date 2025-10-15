import mongoose from 'mongoose';
import config from '../config/env';
import logger from '../utils/logger';

mongoose.set('strictQuery', true);

const obfuscateUri = (uri: string): string => {
  try {
    const parsed = new URL(uri);
    const host = parsed.host;
    const dbName = parsed.pathname.replace('/', '') || 'unknown';
    return `${parsed.protocol}//${host}/${dbName}`;
  } catch (error) {
    return uri;
  }
};

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (!config.mongo.uri) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const connection = await mongoose.connect(config.mongo.uri, {
      autoIndex: config.app.env !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('Connected to MongoDB', { uri: obfuscateUri(config.mongo.uri) });
    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
};

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error', { error });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost');
});
