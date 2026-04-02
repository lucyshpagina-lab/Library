import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId! },
      include: {
        book: {
          select: {
            id: true, title: true, author: true, coverUrl: true,
            genre: true, avgRating: true, ratingsCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ favorites });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookId } = req.body;
    const existing = await prisma.favorite.findUnique({
      where: { userId_bookId: { userId: req.userId!, bookId } },
    });
    if (existing) throw new AppError(409, 'Already in favorites');

    const favorite = await prisma.favorite.create({
      data: { userId: req.userId!, bookId },
    });
    res.status(201).json({ favorite });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = parseInt(req.params.bookId);
    if (isNaN(bookId)) throw new AppError(400, 'Invalid book ID');

    await prisma.favorite.deleteMany({
      where: { userId: req.userId!, bookId },
    });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
}
