import { Types } from 'mongoose';
import { User, IUser } from '../models';
import { ApiError } from '../utils/ApiError';

export class UserService {
  async findById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash -refreshTokens');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async getPerformanceHistory(userId: string, limit = 20) {
    const { Score, Interview } = await import('../models');

    const scores = await Score.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('interviewId', 'title type status completedAt')
      .lean();

    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length
        : 0;

    const completedCount = await Interview.countDocuments({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    });

    return {
      averageScore: Math.round(avgScore * 10) / 10,
      completedInterviews: completedCount,
      recentScores: scores,
    };
  }
}

export const userService = new UserService();
