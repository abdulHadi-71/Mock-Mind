import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { config } from '../config';
import { authService } from '../services/auth.service';

export function isGoogleAuthEnabled(): boolean {
  return Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET);
}

export function configurePassport(): void {
  if (!isGoogleAuthEnabled()) return;

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID!,
        clientSecret: config.GOOGLE_CLIENT_SECRET!,
        callbackURL: config.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            done(new Error('Google account has no email'));
            return;
          }
          const { user, tokens } = await authService.loginWithGoogleProfile({
            googleId: profile.id,
            email,
            name: profile.displayName || email.split('@')[0],
            avatarUrl: profile.photos?.[0]?.value,
          });
          done(null, {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
            oauth: { tokens, dbUser: user },
          });
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}
