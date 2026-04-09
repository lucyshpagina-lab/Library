import { Router } from 'express';
import { processMessage } from '../controllers/chat.controller';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { messageSchema } from '../schemas/chat.schema';

const router = Router();

router.post('/message', optionalAuth, validate(messageSchema), processMessage);

export default router;
