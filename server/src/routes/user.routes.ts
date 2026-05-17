import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/profile', userController.getProfile);
router.get('/performance', userController.getPerformance);

export default router;
