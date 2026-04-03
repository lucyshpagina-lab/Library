import { z } from 'zod';

export const booksQuerySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  sortBy: z.enum(['rating', 'date', 'title', 'author']).optional().default('date'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export const ratingSchema = z.object({
  value: z.number().int().min(1).max(5),
});

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  author: z.string().min(1, 'Author is required').max(300),
  description: z.string().max(5000).optional(),
  genre: z.string().min(1, 'Genre is required').max(100),
  content: z.string().min(1, 'Content is required'),
  pageCount: z.number().int().positive().optional().default(0),
  publishedYear: z.number().int().optional(),
  coverUrl: z.string().url().optional().nullable(),
});
