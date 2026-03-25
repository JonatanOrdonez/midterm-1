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

app.get('/', (_req, res) => {
  res.redirect('http://localhost:3000');
});

// Routes
app.use('/api/stores', storeRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use(errorsMiddleware);

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
  });
};

start();
