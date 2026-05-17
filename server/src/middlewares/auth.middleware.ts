import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { ApiError } from '../utils/ApiError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token required'));
  }

  const token = authHeader.slice(7);
  try {
    req.user = tokenService.verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}
