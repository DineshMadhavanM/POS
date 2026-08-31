import { Router } from 'express';
import { createOrder, checkoutInvoice, getInvoices, refundInvoice } from '../controllers/posController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

router.post('/orders', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.CASHIER]), createOrder);
router.post('/checkout', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.CASHIER]), checkoutInvoice);
router.get('/invoices', getInvoices);
router.post('/invoices/:id/refund', requireRole([UserRole.OWNER, UserRole.ADMIN]), refundInvoice);

export default router;
