import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  generateTokenPair(payload: TokenPayload): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new ApiError(401, 'Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getRefreshTokenExpiry(): Date {
    const match = config.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + value * (multipliers[unit] ?? multipliers.d));
  }
}

export const tokenService = new TokenService();
