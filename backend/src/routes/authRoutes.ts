import { Router } from 'express';
import { register, login, employeeLogin, googleAuth, refresh, getMe, completeOnboarding } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { UserRole } from '../constants/enums';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/employee-login', employeeLogin);
router.post('/google-auth', googleAuth);
router.post('/refresh', refresh);

router.get('/me', authenticate, verifyTenant, getMe);
router.post('/onboarding', authenticate, verifyTenant, requireRole([UserRole.OWNER]), completeOnboarding);

export default router;
