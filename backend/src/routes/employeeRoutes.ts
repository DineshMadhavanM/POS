import { Router } from 'express';
import { getEmployees, inviteEmployee, updateEmployeeRole } from '../controllers/employeeController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/employees', requireRole([UserRole.OWNER, UserRole.ADMIN]), getEmployees);
router.post('/employees', requireRole([UserRole.OWNER, UserRole.ADMIN]), inviteEmployee);
router.put('/employees/:id', requireRole([UserRole.OWNER]), updateEmployeeRole);

export default router;
