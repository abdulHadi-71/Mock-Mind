import { Router } from 'express';
import { z } from 'zod';
import * as interviewController from '../controllers/interview.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

const createSchema = z.object({
  title: z.string().min(3).max(200),
  type: z.enum(['technical', 'behavioral', 'system_design', 'mixed']),
  jobRole: z.string().optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  durationMinutes: z.number().min(15).max(120).optional(),
  questionCount: z.number().min(3).max(15).optional(),
});

const answerSchema = z.object({
  content: z.string().min(1),
  durationSeconds: z.number().min(0).optional(),
});

router.post('/', validateBody(createSchema), interviewController.createInterview);
router.get('/', interviewController.listInterviews);
router.get('/:id', interviewController.getInterview);
router.post('/:id/start', interviewController.startInterview);
router.post(
  '/:id/questions/:questionId/answer',
  validateBody(answerSchema),
  interviewController.submitAnswer
);
router.post('/:id/complete', interviewController.completeInterview);
router.get('/:id/feedback', interviewController.getFeedback);

export default router;
