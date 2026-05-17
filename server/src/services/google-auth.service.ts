import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

export class GoogleAuthService {
  private client: OAuth2Client | null = null;

  private getClient(): OAuth2Client {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
      throw new ApiError(503, 'Google login is not configured');
    }
    if (!this.client) {
      this.client = new OAuth2Client(
        config.GOOGLE_CLIENT_ID,
        config.GOOGLE_CLIENT_SECRET,
        config.GOOGLE_CALLBACK_URL
      );
    }
    return this.client;
  }

  getAuthUrl(): string {
    return this.getClient().generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'select_account',
    });
  }

  async verifyCode(code: string) {
    const client = this.getClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new ApiError(401, 'Google authentication failed');

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new ApiError(401, 'Invalid Google profile');

    return {
      googleId: payload.sub!,
      email: payload.email,
      name: payload.name ?? payload.email.split('@')[0],
      avatarUrl: payload.picture,
    };
  }
}

export const googleAuthService = new GoogleAuthService();
