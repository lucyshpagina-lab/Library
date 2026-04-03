import { Router } from 'express';
import { getBooks, getBook, addComment, rateBook, getGenres, createBook, deleteBook } from '../controllers/books.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { commentSchema, ratingSchema, createBookSchema } from '../schemas/books.schema';

const router = Router();

router.get('/', getBooks);
router.get('/genres', getGenres);
router.post('/', authenticate, validate(createBookSchema), createBook);
router.get('/:id', optionalAuth, getBook);
router.delete('/:id', authenticate, deleteBook);
router.post('/:id/comments', authenticate, validate(commentSchema), addComment);
router.post('/:id/ratings', authenticate, validate(ratingSchema), rateBook);

export default router;
