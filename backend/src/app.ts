import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
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
import superAdminRoutes from './routes/superAdminRoutes';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
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

// Ensure MongoDB connection before route execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Middleware Connection Error]', err);
  }
  next();
});

// API Routes (v1)
const API_PREFIX = '/api/v1';

app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX + '/super-admin', superAdminRoutes);
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

// Static frontend serving (Single Web Service Fullstack mode)
const possibleDistPaths = [
  path.join(process.cwd(), 'frontend', 'dist'),
  path.join(process.cwd(), 'dist'),
  path.join(__dirname, '..', '..', 'frontend', 'dist'),
  path.join(__dirname, '..', 'frontend', 'dist')
];

let frontendDistPath = possibleDistPaths.find((p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

if (frontendDistPath) {
  console.log(`[Express] Serving static frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendDistPath!, 'index.html'));
  });
} else {
  // Fallback API Welcome and Status Page
  app.get('/', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>NexStack POS Backend API</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 480px; width: 90%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #38bdf8; font-size: 22px; margin-bottom: 8px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
          .status { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin: 16px 0; }
          .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #4ade80; }
          .links { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; }
          .link { display: block; background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; color: #cbd5e1; text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s; }
          .link:hover { background: #2563eb; color: white; border-color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ NexStack POS Backend API</h1>
          <div class="status"><span class="dot"></span> Service Status: ACTIVE & ONLINE</div>
          <p>The POS backend server is running and connected to MongoDB Atlas Cloud.</p>
          <div class="links">
            <a href="/health" class="link">🩺 Health Check API (/health)</a>
            <a href="/api/v1/super-admin/tenants" class="link">🏢 Super Admin Tenants Directory</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Global Error Handler
app.use(errorHandler);

module.exports = app;
export default app;
