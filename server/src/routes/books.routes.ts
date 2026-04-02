import { Router } from 'express';
import { getBooks, getBook, addComment, rateBook, getGenres } from '../controllers/books.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { commentSchema, ratingSchema } from '../schemas/books.schema';

const router = Router();

router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/:id', optionalAuth, getBook);
router.post('/:id/comments', authenticate, validate(commentSchema), addComment);
router.post('/:id/ratings', authenticate, validate(ratingSchema), rateBook);

export default router;
