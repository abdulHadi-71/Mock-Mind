import { Request, Response } from 'express';
import { interviewService } from '../services/interview.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getParam } from '../utils/params';

export const createInterview = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.start({
    userId: req.user!.sub,
    role: req.body.role ?? 'fullstack',
    difficulty: req.body.difficulty ?? req.body.experienceLevel ?? 'mid',
    type: req.body.type ?? 'mixed',
    questionCount: req.body.questionCount,
  });
  res.status(201).json({ success: true, data: result });
});

export const listInterviews = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await interviewService.getHistory(req.user!.sub, page, limit);
  res.json({ success: true, data: result });
});

export const getInterview = asyncHandler(async (req: Request, res: Response) => {
  const data = await interviewService.getSession(req.user!.sub, getParam(req, 'id'));
  res.json({ success: true, data });
});

export const startInterview = asyncHandler(async (req: Request, res: Response) => {
  const data = await interviewService.getSession(req.user!.sub, getParam(req, 'id'));
  res.json({ success: true, data: data.interview });
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.submitAnswer({
    userId: req.user!.sub,
    interviewId: getParam(req, 'id'),
    answer: req.body.content,
    durationSeconds: req.body.durationSeconds,
  });
  res.json({ success: true, data: result });
});

export const completeInterview = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.submitAnswer({
    userId: req.user!.sub,
    interviewId: getParam(req, 'id'),
    answer: req.body.content ?? '(skipped)',
  });
  res.json({ success: true, data: result });
});

export const getFeedback = asyncHandler(async (req: Request, res: Response) => {
  const data = await interviewService.getResult(req.user!.sub, getParam(req, 'id'));
  res.json({ success: true, data });
});
