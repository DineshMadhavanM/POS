import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/productController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

// Product Catalog (Readable by all active tenant roles: Owner, Admin, Manager, Cashier, Waiter, Kitchen, Inventory)
router.get('/products', getProducts);
router.post('/products', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF]), createProduct);
router.put('/products/:id', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF]), updateProduct);
router.delete('/products/:id', requireRole([UserRole.OWNER, UserRole.ADMIN]), deleteProduct);

// Categories
router.get('/categories', getCategories);
router.post('/categories', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF]), createCategory);
router.put('/categories/:id', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF]), updateCategory);
router.delete('/categories/:id', requireRole([UserRole.OWNER, UserRole.ADMIN]), deleteCategory);

export default router;
