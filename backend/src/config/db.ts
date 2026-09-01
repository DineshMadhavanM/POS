import mongoose from 'mongoose';
import { env } from './env';

/**
 * Global cached database connection for serverless / lambda environments
 */
let isConnecting = false;

export const connectDB = async (): Promise<string> => {
  // If already connected
  if ((mongoose.connection.readyState as number) === 1) {
    return env.MONGO_URI;
  }

  if (isConnecting) {
    // Wait for in-progress connection
    await new Promise((resolve) => setTimeout(resolve, 500));
    if ((mongoose.connection.readyState as number) === 1) return env.MONGO_URI;
  }

  try {
    isConnecting = true;
    mongoose.set('strictQuery', true);

    const uri = env.MONGO_URI || 'mongodb+srv://kit27ad17:Aidsdr-003@cluster0.nl8lf1t.mongodb.net/nineteen06?retryWrites=true&w=majority';
    console.log('[MongoDB] Connecting to MongoDB Atlas Cloud Database...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });

    console.log('[MongoDB] Connected successfully to MongoDB Atlas Cloud');
    return uri;
  } catch (error: any) {
    console.error('[MongoDB Error] Database connection failure:', error.message || error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if ((mongoose.connection.readyState as number) !== 0) {
      await mongoose.disconnect();
      console.log('[MongoDB] Disconnected successfully');
    }
  } catch (error: any) {
    console.error('[MongoDB Error] Disconnect failure:', error.message || error);
  }
};
