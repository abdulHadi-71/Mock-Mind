import type { TokenPayload, AuthTokens } from '../services/token.service';
import type { IUser } from '../models';

declare global {
  namespace Express {
    interface User extends TokenPayload {
      oauth?: { tokens: AuthTokens; dbUser: IUser };
    }
  }
}

export {};
