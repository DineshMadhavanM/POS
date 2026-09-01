"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db");
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const posRoutes_1 = __importDefault(require("./routes/posRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const restaurantRoutes_1 = __importDefault(require("./routes/restaurantRoutes"));
const bakeryRoutes_1 = __importDefault(require("./routes/bakeryRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const superAdminRoutes_1 = __importDefault(require("./routes/superAdminRoutes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'NexStack POS API', timestamp: new Date() });
});
// Ensure MongoDB connection before route execution
app.use(async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
    }
    catch (err) {
        console.error('[DB Middleware Connection Error]', err);
    }
    next();
});
// API Routes (v1)
const API_PREFIX = '/api/v1';
app.use(API_PREFIX, authRoutes_1.default);
app.use(API_PREFIX + '/super-admin', superAdminRoutes_1.default);
app.use(API_PREFIX, productRoutes_1.default);
app.use(API_PREFIX, customerRoutes_1.default);
app.use(API_PREFIX + '/pos', posRoutes_1.default);
app.use(API_PREFIX, posRoutes_1.default);
app.use(API_PREFIX, inventoryRoutes_1.default);
app.use(API_PREFIX, employeeRoutes_1.default);
app.use(API_PREFIX, restaurantRoutes_1.default);
app.use(API_PREFIX, bakeryRoutes_1.default);
app.use(API_PREFIX, analyticsRoutes_1.default);
app.use(API_PREFIX, aiRoutes_1.default);
// Static frontend serving (Single Web Service Fullstack mode)
const possibleDistPaths = [
    path_1.default.join(process.cwd(), 'frontend', 'dist'),
    path_1.default.join(process.cwd(), 'dist'),
    path_1.default.join(__dirname, '..', '..', 'frontend', 'dist'),
    path_1.default.join(__dirname, '..', 'frontend', 'dist')
];
let frontendDistPath = possibleDistPaths.find((p) => fs_1.default.existsSync(p) && fs_1.default.existsSync(path_1.default.join(p, 'index.html')));
if (frontendDistPath) {
    console.log(`[Express] Serving static frontend from: ${frontendDistPath}`);
    app.use(express_1.default.static(frontendDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/health') {
            return next();
        }
        res.sendFile(path_1.default.join(frontendDistPath, 'index.html'));
    });
}
else {
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
app.use(errorHandler_1.errorHandler);
module.exports = app;
exports.default = app;
