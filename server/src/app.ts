import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { config } from './config';
import { configurePassport } from './config/passport';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

configurePassport();

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(passport.initialize());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
