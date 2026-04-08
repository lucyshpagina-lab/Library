import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { booksQuerySchema } from '../schemas/books.schema';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export async function getBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const query = booksQuerySchema.parse(req.query);
    const { search, genre, sortBy, order, page, limit } = query;

    const where: Prisma.BookWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (genre) {
      where.genre = genre;
    }

    const orderBy: Prisma.BookOrderByWithRelationInput = {};
    if (sortBy === 'rating') orderBy.avgRating = order;
    else if (sortBy === 'title') orderBy.title = order;
    else if (sortBy === 'author') orderBy.author = order;
    else orderBy.createdAt = order;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          coverUrl: true,
          genre: true,
          pageCount: true,
          publishedYear: true,
          avgRating: true,
          ratingsCount: true,
          createdAt: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      books,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, 'Invalid book ID');

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { username: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!book) throw new AppError(404, 'Book not found');

    let userRating = null;
    if (req.userId) {
      userRating = await prisma.rating.findUnique({
        where: { userId_bookId: { userId: req.userId, bookId: id } },
      });
    }

    res.json({ book, userRating });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) throw new AppError(400, 'Invalid book ID');

    const comment = await prisma.comment.create({
      data: { userId: req.userId!, bookId, text: req.body.text },
      include: { user: { select: { username: true, avatarUrl: true } } },
    });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function rateBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) throw new AppError(400, 'Invalid book ID');

    const userId = req.userId!;
    const { value } = req.body;

    await prisma.rating.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, value },
      update: { value },
    });

    // Recalculate avg rating
    const agg = await prisma.rating.aggregate({
      where: { bookId },
      _avg: { value: true },
      _count: { value: true },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: {
        avgRating: agg._avg.value || 0,
        ratingsCount: agg._count.value,
      },
    });

    res.json({ avgRating: agg._avg.value, ratingsCount: agg._count.value });
  } catch (err) {
    next(err);
  }
}

export async function createBook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAdmin) {
      throw new AppError(403, 'Only admins can create books');
    }
    const book = await prisma.book.create({
      data: req.body,
    });
    res.status(201).json({ book });
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAdmin) {
      throw new AppError(403, 'Only admins can delete books');
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, 'Invalid book ID');

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new AppError(404, 'Book not found');

    await prisma.comment.deleteMany({ where: { bookId: id } });
    await prisma.rating.deleteMany({ where: { bookId: id } });
    await prisma.readingProgress.deleteMany({ where: { bookId: id } });
    await prisma.favorite.deleteMany({ where: { bookId: id } });
    await prisma.book.delete({ where: { id } });

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getGenres(_req: Request, res: Response, next: NextFunction) {
  try {
    const genres = await prisma.book.findMany({
      select: { genre: true },
      distinct: ['genre'],
      orderBy: { genre: 'asc' },
    });
    res.json({ genres: genres.map((g) => g.genre) });
  } catch (err) {
    next(err);
  }
}
