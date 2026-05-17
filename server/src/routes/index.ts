import { Router } from 'express';
import authRoutes from './auth.routes';
import interviewRoutes from './interview.routes';
import interviewV2Routes from './interview-v2.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import reportRoutes from './report.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'AIMI API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/interview', interviewV2Routes);
router.use('/interviews', interviewRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

export default router;
