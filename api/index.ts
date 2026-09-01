import app from '../backend/src/app';
import { connectDB } from '../backend/src/config/db';

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('[Vercel Serverless DB Connection Error]:', error);
    }
  }
  return app(req, res);
}
