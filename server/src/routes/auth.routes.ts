import { Router } from 'express';
import { register, login, me, logout, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, changePasswordSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);
router.post('/logout', logout);
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
