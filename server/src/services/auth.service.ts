import { User, IUser } from '../models';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { tokenService, TokenPayload, AuthTokens } from './token.service';
import type { IRefreshTokenEntry } from '../models/User';

const MAX_REFRESH_TOKENS = 5;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function pruneRefreshTokens(tokens: IRefreshTokenEntry[]): IRefreshTokenEntry[] {
  return tokens.filter((t) => t.expiresAt > new Date()).slice(-MAX_REFRESH_TOKENS);
}

function buildRefreshEntry(refreshToken: string): IRefreshTokenEntry {
  return {
    tokenHash: tokenService.hashRefreshToken(refreshToken),
    expiresAt: tokenService.getRefreshTokenExpiry(),
    createdAt: new Date(),
  };
}

export class AuthService {
  private buildPayload(user: IUser): TokenPayload {
    return {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  /** Atomic write — avoids VersionError when multiple refresh requests run in parallel. */
  private async setRefreshTokens(userId: string, refreshTokens: IRefreshTokenEntry[]): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { refreshTokens: pruneRefreshTokens(refreshTokens) } });
  }

  private async appendRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) throw new ApiError(401, 'User not found');

    const next = pruneRefreshTokens([...user.refreshTokens, buildRefreshEntry(refreshToken)]);
    await this.setRefreshTokens(userId, next);
  }

  async register(input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
    });

    const tokens = tokenService.generateTokenPair(this.buildPayload(user));
    await this.appendRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select(
      '+passwordHash'
    );
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (!user.passwordHash) {
      throw new ApiError(401, 'This account uses Google sign-in');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const tokens = tokenService.generateTokenPair(this.buildPayload(user));
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLoginAt: new Date() },
    });
    await this.appendRefreshToken(user._id.toString(), tokens.refreshToken);

    user.lastLoginAt = new Date();
    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    const tokenHash = tokenService.hashRefreshToken(refreshToken);
    const now = new Date();

    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const stored = user.refreshTokens.find(
      (t) => t.tokenHash === tokenHash && t.expiresAt > now
    );
    if (!stored) {
      throw new ApiError(401, 'Refresh token revoked or expired');
    }

    const tokens = tokenService.generateTokenPair(this.buildPayload(user));
    const rotated = pruneRefreshTokens([
      ...user.refreshTokens.filter((t) => t.tokenHash !== tokenHash),
      buildRefreshEntry(tokens.refreshToken),
    ]);

    // Only update if the presented refresh token is still valid (prevents double-rotation races).
    const updated = await User.findOneAndUpdate(
      {
        _id: payload.sub,
        refreshTokens: {
          $elemMatch: { tokenHash, expiresAt: { $gt: now } },
        },
      },
      { $set: { refreshTokens: rotated } },
      { new: true }
    );

    if (!updated) {
      throw new ApiError(401, 'Refresh token revoked or expired');
    }

    return tokens;
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = tokenService.hashRefreshToken(refreshToken);
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { tokenHash } },
      });
      return;
    }
    await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
  }

  async loginWithGoogleProfile(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ user: IUser; tokens: AuthTokens }> {
    let user = await User.findOne({
      $or: [{ googleId: profile.googleId }, { email: profile.email.toLowerCase() }],
    }).select('+refreshTokens');

    if (user) {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            googleId: profile.googleId,
            avatarUrl: profile.avatarUrl ?? user.avatarUrl,
            name: user.name || profile.name,
            isEmailVerified: true,
            lastLoginAt: new Date(),
          },
        },
        { new: true }
      );
      if (!user) throw new ApiError(500, 'Failed to update user');
    } else {
      user = await User.create({
        email: profile.email.toLowerCase(),
        googleId: profile.googleId,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });
    }

    const tokens = tokenService.generateTokenPair(this.buildPayload(user));
    await this.appendRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user, tokens };
  }

  sanitizeUser(user: IUser) {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
