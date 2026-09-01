import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  try {
    // Set Mongoose options
    mongoose.set('strictQuery', true);

    let uri = env.MONGO_URI;

    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas Cloud...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 25000,
        connectTimeoutMS: 25000
      });
      console.log(`[MongoDB] Connected successfully to primary URI: ${uri}`);
      return uri;
    } catch (err: any) {
      console.warn('[MongoDB Atlas Warning] Primary Atlas connection failed or timed out:', err.message);
      console.warn('[MongoDB] Initializing MongoMemoryServer fallback...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[MongoDB Memory Server] Connected to in-memory database: ${uri}`);
      return uri;
    }
  } catch (error) {
    console.error('[MongoDB Error] Database connection failure:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error('[MongoDB Error] Disconnect failure:', error);
  }
};
