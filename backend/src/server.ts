import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`=================================================`);
    console.log(` NexStack POS Backend API running on port ${env.PORT}`);
    console.log(` Health check: http://localhost:${env.PORT}/health`);
    console.log(`=================================================`);
  });
};

startServer();
