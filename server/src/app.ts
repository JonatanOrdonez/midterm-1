import express from 'express';
import { NODE_ENV, PORT } from './config';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as storeRouter } from './features/stores/store.router';
import { initDb } from './config/initDb';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  const endpoints = {
    'GET /api/stores': 'Get all stores',
    'GET /api/stores/:id': 'Get a store by ID',
    'POST /api/stores/:id/products': 'Create a product for a store',
    'POST /api/auth/register': 'Register a new user',
    'POST /api/auth/login': 'Login and receive a token',
  };
  res.json(endpoints);
});

// Routes
app.use('/api/stores', storeRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use(errorsMiddleware);

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    // console.log('Server running on port ' + PORT);
  });
};

start();
