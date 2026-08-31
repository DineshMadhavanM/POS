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
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[MongoDB] Connected successfully to primary URI: ${uri}`);
      return uri;
    } catch (err) {
      console.warn('[MongoDB] Primary URI connection failed or timed out. Initializing MongoMemoryServer fallback...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[MongoDB Memory Server] Connected successfully to in-memory database: ${uri}`);
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
