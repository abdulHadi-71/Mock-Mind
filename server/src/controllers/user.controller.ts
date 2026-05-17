import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getProfile(req.user!.sub);
  res.json({ success: true, data: profile });
});

export const getPerformance = asyncHandler(async (req: Request, res: Response) => {
  const history = await userService.getPerformanceHistory(req.user!.sub);
  res.json({ success: true, data: history });
});
