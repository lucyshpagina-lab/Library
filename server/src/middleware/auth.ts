import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
      isAdmin?: boolean;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    prisma.user
      .findUnique({ where: { id: payload.userId }, select: { isAdmin: true } })
      .then((user) => {
        req.isAdmin = user?.isAdmin ?? false;
        next();
      })
      .catch(() => {
        res.status(401).json({ error: 'User not found' });
      });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.userId;
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
}
