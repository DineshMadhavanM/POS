import { Router } from 'express';
import { getCustomCakeOrders, createCustomCakeOrder, updateCakeOrderStatus } from '../controllers/bakeryController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/bakery/cake-orders', getCustomCakeOrders);
router.post('/bakery/cake-orders', createCustomCakeOrder);
router.put('/bakery/cake-orders/:id/status', updateCakeOrderStatus);

export default router;
