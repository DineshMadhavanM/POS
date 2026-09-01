"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
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
app.use((0, helmet_1.default)());
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
// Ensure MongoDB connection before route execution (essential for Vercel serverless)
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
// Global Error Handler
app.use(errorHandler_1.errorHandler);
module.exports = app;
exports.default = app;
