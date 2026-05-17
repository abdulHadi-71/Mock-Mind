import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, 'Route not found'));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (config.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
