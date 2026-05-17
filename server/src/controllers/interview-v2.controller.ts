import { Request, Response } from 'express';
import { interviewEngineService } from '../services/interview-engine.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getParam } from '../utils/params';

export const start = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.start({
    userId: req.user!.sub,
    ...req.body,
  });
  res.status(201).json({
    success: true,
    data: {
      interview: {
        _id: result.interview._id.toString(),
        title: result.interview.title,
        status: result.interview.status,
        questionCount: result.interview.questionCount,
        role: result.interview.role,
        difficulty: result.interview.difficulty,
        type: result.interview.type,
      },
    },
  });
});

export const generateFirstQuestion = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.generateFirstQuestion(
    req.user!.sub,
    req.body.interviewId
  );
  res.json({
    success: true,
    data: {
      interview: {
        _id: result.interview._id.toString(),
        title: result.interview.title,
        questionCount: result.interview.questionCount,
      },
      question: {
        _id: result.question._id.toString(),
        text: result.question.text,
        order: result.question.order,
      },
      aiResponse: result.aiResponse,
    },
  });
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.submitAnswer({
    userId: req.user!.sub,
    interviewId: req.body.interviewId,
    answer: req.body.answer,
    durationSeconds: req.body.durationSeconds,
  });
  res.json({ success: true, data: result });
});

export const nextQuestion = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.getNextQuestion(
    req.user!.sub,
    req.body.interviewId
  );
  res.json({ success: true, data: result });
});

export const getResult = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.getResult(
    req.user!.sub,
    getParam(req, 'id')
  );
  res.json({ success: true, data: result });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await interviewEngineService.getHistory(req.user!.sub, page, limit);
  res.json({ success: true, data: result });
});

export const endInterview = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.endInterview(
    req.user!.sub,
    req.body.interviewId
  );
  res.json({ success: true, data: result });
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewEngineService.getSession(
    req.user!.sub,
    getParam(req, 'id')
  );
  res.json({ success: true, data: result });
});
