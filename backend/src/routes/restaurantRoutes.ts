import { Router } from 'express';
import { getTables, createTable, updateTableStatus, deleteTable, getKOTTickets, createKOTTicket, updateKOTStatus } from '../controllers/restaurantController';
import { authenticate } from '../middlewares/authMiddleware';
import { verifyTenant } from '../middlewares/tenantMiddleware';

const router = Router();

router.use(authenticate, verifyTenant);

router.get('/restaurant/tables', getTables);
router.post('/restaurant/tables', createTable);
router.put('/restaurant/tables/:id/status', updateTableStatus);
router.delete('/restaurant/tables/:id', deleteTable);

router.get('/restaurant/kot', getKOTTickets);
router.post('/restaurant/kot', createKOTTicket);
router.put('/restaurant/kot/:id/status', updateKOTStatus);

export default router;
