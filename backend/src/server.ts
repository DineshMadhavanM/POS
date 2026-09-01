import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

let dbInitialized = false;

// Middleware to ensure DB connection on serverless requests
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await connectDB();
      dbInitialized = true;
    } catch (err) {
      console.error('[DB Initialization Error]', err);
    }
  }
  next();
});

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    await connectDB();
    dbInitialized = true;

    app.listen(env.PORT, () => {
      console.log(`=================================================`);
      console.log(` NexStack POS Backend API running on port ${env.PORT}`);
      console.log(` Health check: http://localhost:${env.PORT}/health`);
      console.log(`=================================================`);
    });
  }
};

startServer();

export default app;
