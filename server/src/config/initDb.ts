import { db } from './database';
import bcrypt from 'bcryptjs';

export const initDb = async (): Promise<void> => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      email    TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stores (
      id      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name    TEXT NOT NULL,
      "isOpen" BOOLEAN NOT NULL DEFAULT FALSE,
      "userId" TEXT NOT NULL REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name    TEXT NOT NULL,
      price   NUMERIC NOT NULL,
      "storeId" TEXT NOT NULL REFERENCES stores(id)
    );
  `);

  await seedUsers();
};

const seedUsers = async (): Promise<void> => {
  const existing = await db.query('SELECT id FROM users LIMIT 1');
  if (existing.rows.length > 0) return;

  const hash = await bcrypt.hash('123456', 10);

  const consumer = await db.query<{ id: string }>(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
    ['customer@email.com', hash, 'consumer']
  );

  const store = await db.query<{ id: string }>(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
    ['store@email.com', hash, 'store']
  );

  await db.query(
    'INSERT INTO stores (name, "isOpen", "userId") VALUES ($1, $2, $3)',
    ['My Store', false, store.rows[0].id]
  );

  console.log('Seed users created:', consumer.rows[0].id, store.rows[0].id);
};
