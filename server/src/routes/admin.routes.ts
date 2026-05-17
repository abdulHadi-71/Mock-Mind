import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/users', adminController.listUsers);
router.get('/analytics', adminController.getAnalytics);
export default router;
