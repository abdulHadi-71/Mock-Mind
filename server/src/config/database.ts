import mongoose from 'mongoose';
import { config } from './index';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.MONGODB_URI, {
    dbName: 'aimi',
  });

  console.log('MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
