import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import posRoutes from './routes/posRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import employeeRoutes from './routes/employeeRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import bakeryRoutes from './routes/bakeryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'NexStack POS API', timestamp: new Date() });
});

// API Routes (v1)
const API_PREFIX = '/api/v1';

app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, productRoutes);
app.use(API_PREFIX, customerRoutes);
app.use(API_PREFIX + '/pos', posRoutes);
app.use(API_PREFIX, posRoutes);
app.use(API_PREFIX, inventoryRoutes);
app.use(API_PREFIX, employeeRoutes);
app.use(API_PREFIX, restaurantRoutes);
app.use(API_PREFIX, bakeryRoutes);
app.use(API_PREFIX, analyticsRoutes);
app.use(API_PREFIX, aiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
