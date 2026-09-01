import { Router } from 'express';
import { createOrder, getOrders, deleteOrder, checkoutInvoice, getInvoices, refundInvoice } from '../controllers/posController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/orders', getOrders);
router.post('/orders', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.WAITER]), createOrder);
router.delete('/orders/:id', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]), deleteOrder);
router.post('/checkout', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]), checkoutInvoice);
router.get('/invoices', getInvoices);
router.post('/invoices/:id/refund', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]), refundInvoice);

export default router;
