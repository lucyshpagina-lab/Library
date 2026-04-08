import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const skip = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

export const authRateLimiter: RequestHandler = skip
  ? (_req: Request, _res: Response, next: NextFunction) => {
      next();
    }
  : rateLimit({
      windowMs: 60 * 1000,
      max: 10,
      message: { error: 'Too many requests, please try again later' },
      standardHeaders: true,
      legacyHeaders: false,
    });
