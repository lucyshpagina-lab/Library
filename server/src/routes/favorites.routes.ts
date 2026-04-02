import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorites.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:bookId', authenticate, removeFavorite);

export default router;
