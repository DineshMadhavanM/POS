import { Router } from 'express';
import { processAIQuery } from '../controllers/aiController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';

const router = Router();

router.use(authenticate, verifyTenant);

router.post('/ai/query', processAIQuery);

export default router;
