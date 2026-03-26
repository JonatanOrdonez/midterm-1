import express from 'express';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as storeRouter } from './features/stores/store.router';

export const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.redirect('http://localhost:3001');
});

// Routes
app.use('/api/stores', storeRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use(errorsMiddleware);
