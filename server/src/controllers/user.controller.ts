import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new AppError(404, 'User not found');

    const [favoriteCount, booksRead] = await Promise.all([
      prisma.favorite.count({ where: { userId: req.userId! } }),
      prisma.readingProgress.count({ where: { userId: req.userId! } }),
    ]);

    res.json({ user, stats: { favoriteCount, booksRead } });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { ...(username && { username }), ...(avatarUrl !== undefined && { avatarUrl }) },
      select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // Delete old avatar file if it exists
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId! }, select: { avatarUrl: true } });
    if (currentUser?.avatarUrl?.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', currentUser.avatarUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { avatarUrl },
      select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId! }, select: { avatarUrl: true } });
    if (currentUser?.avatarUrl?.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', currentUser.avatarUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { avatarUrl: null },
      select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}
