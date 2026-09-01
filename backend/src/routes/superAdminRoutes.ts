import { Router } from 'express';
import { superAdminLogin, getSuperAdminTenants } from '../controllers/superAdminController';

const router = Router();

// Public Super Admin Authentication
router.post('/login', superAdminLogin);

// Master Tenant Directory Endpoint
router.get('/tenants', getSuperAdminTenants);

export default router;
