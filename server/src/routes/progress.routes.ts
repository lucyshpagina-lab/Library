import { Router } from 'express';
import { getProgress, saveProgress } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getProgress);
router.post('/', authenticate, saveProgress);

export default router;
