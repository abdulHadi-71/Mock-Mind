import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import * as ctrl from '../controllers/interview-v2.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { cvService } from '../services/cv.service';
import { ApiError } from '../utils/ApiError';

const router = Router();
router.use(authenticate);

// Multer setup — store CV in memory (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

// Middleware to parse CV text from uploaded file
async function parseCvFile(req: Request, _res: Response, next: NextFunction) {
  if (!req.file) {
    console.log('No file uploaded');
    return next();
  }

  try {
    console.log(`Processing file: ${req.file.originalname}, MIME: ${req.file.mimetype}, Size: ${req.file.size}`);
    const cvText = await cvService.parseCv(req.file.buffer, req.file.mimetype);
    req.body.cvText = cvText;
    console.log(`✓ CV parsed successfully, text length: ${cvText.length}`);
    next();
  } catch (err: any) {
    console.error('CV Parse Error:', err.message);
    next(new ApiError(400, err.message || 'Failed to parse CV file'));
  }
}

const startSchema = z.object({
  role: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'data', 'mobile', 'qa', 'product']),
  difficulty: z.enum(['junior', 'mid', 'senior']),
  type: z.enum(['technical', 'behavioral', 'mixed']),
  questionCount: z.coerce.number().min(10).max(25).optional(),
  cvText: z.string().optional(),
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

router.post('/start', upload.single('cv'), parseCvFile, validateBody(startSchema), ctrl.start);
router.post('/generate-first-question', validateBody(interviewIdSchema), ctrl.generateFirstQuestion);
router.post('/end', validateBody(endSchema), ctrl.endInterview);
router.post('/submit-answer', validateBody(answerSchema), ctrl.submitAnswer);
router.post('/next-question', validateBody(nextSchema), ctrl.nextQuestion);
router.get('/result/:id', ctrl.getResult);
router.get('/history', ctrl.getHistory);
router.get('/session/:id', ctrl.getSession);

export default router;
