import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from '../services/auth.service';
import { config } from '../config';
import { isGoogleAuthEnabled } from '../config/passport';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import type { AuthTokens } from '../services/token.service';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function redirectWithTokens(res: Response, tokens: AuthTokens) {
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.redirect(
    `${config.CLIENT_URL}/auth/google/callback?token=${encodeURIComponent(tokens.accessToken)}`
  );
}

export const googleStatus = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { enabled: isGoogleAuthEnabled() } });
});

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isGoogleAuthEnabled()) {
    next(
      new ApiError(
        503,
        'Google login is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server .env'
      )
    );
    return;
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
  })(req, res, next);
};

export const googleCallback = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!isGoogleAuthEnabled()) {
      res.redirect(`${config.CLIENT_URL}/login?error=google_auth_failed`);
      return;
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${config.CLIENT_URL}/login?error=google_auth_failed`,
    })(req, res, next);
  },
  (req: Request, res: Response) => {
    const tokens = req.user?.oauth?.tokens;
    if (!tokens) {
      res.redirect(`${config.CLIENT_URL}/login?error=google_auth_failed`);
      return;
    }
    redirectWithTokens(res, tokens);
  },
];

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    data: {
      user: authService.sanitizeUser(user),
      accessToken: tokens.accessToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.json({
    success: true,
    data: {
      user: authService.sanitizeUser(user),
      accessToken: tokens.accessToken,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] ?? req.body.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ success: false, message: 'Refresh token required' });
    return;
  }
  const tokens = await authService.refresh(refreshToken);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (req.user) {
    await authService.logout(req.user.sub, refreshToken);
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { userService } = await import('../services/user.service');
  const profile = await userService.getProfile(req.user!.sub);
  res.json({ success: true, data: profile });
});
