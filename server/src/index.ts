import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import favoritesRoutes from './routes/favorites.routes';
import progressRoutes from './routes/progress.routes';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
