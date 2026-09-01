import { Router } from 'express';
import { getDashboardMetrics, getSalesChartData, getTopProductsReport, getReportsSummary } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/analytics/dashboard', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]), getDashboardMetrics);
router.get('/analytics/sales-chart', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]), getSalesChartData);
router.get('/analytics/top-products', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]), getTopProductsReport);
router.get('/analytics/reports', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]), getReportsSummary);

export default router;
