import { Router } from 'express';
import { adjustStock, getStockMovements, getSuppliers, createSupplier } from '../controllers/inventoryController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

router.post('/inventory/adjust', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), adjustStock);
router.get('/inventory/movements', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), getStockMovements);
router.get('/suppliers', getSuppliers);
router.post('/suppliers', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), createSupplier);

export default router;
