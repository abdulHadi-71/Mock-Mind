import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/interview-v2.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();
router.use(authenticate);

const startSchema = z.object({
  role: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'data', 'mobile', 'qa', 'product']),
  difficulty: z.enum(['junior', 'mid', 'senior']),
  type: z.enum(['technical', 'behavioral', 'mixed']),
  questionCount: z.number().min(10).max(15).optional(),
});

const answerSchema = z.object({
  interviewId: z.string().min(1),
  answer: z.string().min(1),
  durationSeconds: z.number().min(0).optional(),
});

const nextSchema = z.object({
  interviewId: z.string().min(1),
});

const endSchema = z.object({
  interviewId: z.string().min(1),
});

const interviewIdSchema = z.object({
  interviewId: z.string().min(1),
});

router.post('/start', validateBody(startSchema), ctrl.start);
router.post('/generate-first-question', validateBody(interviewIdSchema), ctrl.generateFirstQuestion);
router.post('/end', validateBody(endSchema), ctrl.endInterview);
router.post('/submit-answer', validateBody(answerSchema), ctrl.submitAnswer);
router.post('/next-question', validateBody(nextSchema), ctrl.nextQuestion);
router.get('/result/:id', ctrl.getResult);
router.get('/history', ctrl.getHistory);
router.get('/session/:id', ctrl.getSession);

export default router;
