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
