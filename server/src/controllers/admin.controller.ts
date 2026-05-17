import { Request, Response } from 'express';
import { User, Interview, Score } from '../models';
import { asyncHandler } from '../utils/asyncHandler';

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find()
    .select('-passwordHash -refreshTokens')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data: users });
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalInterviews, completedInterviews, avgScore] = await Promise.all([
    User.countDocuments(),
    Interview.countDocuments(),
    Interview.countDocuments({ status: 'completed' }),
    Score.aggregate([{ $group: { _id: null, avg: { $avg: '$overallScore' } } }]),
  ]);

  const interviewsByRole = await Interview.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalInterviews,
      completedInterviews,
      averageScore: Math.round((avgScore[0]?.avg ?? 0) * 10) / 10,
      interviewsByRole,
    },
  });
});
