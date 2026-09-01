"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantMiddleware_1 = require("../middlewares/tenantMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, tenantMiddleware_1.verifyTenant);
// Dashboard & Analytics endpoints (accessible by all authenticated organization staff)
router.get('/analytics/dashboard', analyticsController_1.getDashboardMetrics);
router.get('/analytics/sales-chart', analyticsController_1.getSalesChartData);
router.get('/analytics/top-products', analyticsController_1.getTopProductsReport);
router.get('/analytics/reports', analyticsController_1.getReportsSummary);
exports.default = router;
