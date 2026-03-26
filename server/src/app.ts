import express from 'express';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as storeRouter } from './features/stores/store.router';

export const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.json([
    { method: 'POST', endpoint: '/api/auth/register' },
    { method: 'POST', endpoint: '/api/auth/login' },
    { method: 'GET',  endpoint: '/api/stores' },
    { method: 'GET',  endpoint: '/api/stores/mine' },
    { method: 'GET',  endpoint: '/api/stores/:id' },
    { method: 'PATCH', endpoint: '/api/stores/:id' },
    { method: 'POST', endpoint: '/api/stores/:id/products' },
    { method: 'DELETE', endpoint: '/api/stores/:id/products/:productId' },
  ]);
});

// Routes
app.use('/api/stores', storeRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use(errorsMiddleware);
