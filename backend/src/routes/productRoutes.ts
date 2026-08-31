import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/productController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/products', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.CASHIER, UserRole.INVENTORY_STAFF]), getProducts);
router.post('/products', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), createProduct);
router.put('/products/:id', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), updateProduct);
router.delete('/products/:id', requireRole([UserRole.OWNER, UserRole.ADMIN]), deleteProduct);

router.get('/categories', getCategories);
router.post('/categories', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), createCategory);
router.put('/categories/:id', requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]), updateCategory);
router.delete('/categories/:id', requireRole([UserRole.OWNER, UserRole.ADMIN]), deleteCategory);

export default router;
