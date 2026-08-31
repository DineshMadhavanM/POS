import { Router } from 'express';
import { getCustomers, createCustomer, getCustomerById } from '../controllers/customerController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/customers', getCustomers);
router.post('/customers', createCustomer);
router.get('/customers/:id', getCustomerById);

export default router;
