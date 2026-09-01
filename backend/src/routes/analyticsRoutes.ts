import { Router } from 'express';
import { getDashboardMetrics, getSalesChartData, getTopProductsReport, getReportsSummary } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';

const router = Router();

router.use(authenticate, verifyTenant);

// Dashboard & Analytics endpoints (accessible by all authenticated organization staff)
router.get('/analytics/dashboard', getDashboardMetrics);
router.get('/analytics/sales-chart', getSalesChartData);
router.get('/analytics/top-products', getTopProductsReport);
router.get('/analytics/reports', getReportsSummary);

export default router;
