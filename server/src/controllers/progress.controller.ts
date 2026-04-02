import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = req.query.bookId ? parseInt(req.query.bookId as string) : undefined;

    const where: { userId: number; bookId?: number } = { userId: req.userId! };
    if (bookId) where.bookId = bookId;

    const progress = await prisma.readingProgress.findMany({
      where,
      include: {
        book: {
          select: { id: true, title: true, author: true, coverUrl: true, pageCount: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

export async function saveProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookId, currentPage, scrollPosition } = req.body;

    const progress = await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId: req.userId!, bookId } },
      create: { userId: req.userId!, bookId, currentPage, scrollPosition },
      update: { currentPage, scrollPosition },
    });
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}
