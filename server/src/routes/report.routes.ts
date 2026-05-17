import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/:id/pdf', reportController.downloadPdf);
router.post('/:id/email', reportController.emailReport);
export default router;
