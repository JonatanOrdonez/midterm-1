import { db } from './database';
import bcrypt from 'bcryptjs';

export const initDb = async (): Promise<void> => {
  await db.exec(`
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS stores CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      email    TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stores (
      id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name     TEXT NOT NULL,
      is_open  BOOLEAN NOT NULL DEFAULT FALSE,
      user_id  TEXT NOT NULL REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name     TEXT NOT NULL,
      price    NUMERIC NOT NULL,
      store_id TEXT NOT NULL REFERENCES stores(id)
    );
  `);

  await seedUsers();
};

const seedUsers = async (): Promise<void> => {
  const hash = await bcrypt.hash('123456', 10);

  const consumer = await db.query<{ id: string }>(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
    ['customer@email.com', hash, 'consumer']
  );

  const store = await db.query<{ id: string }>(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
    ['store@email.com', hash, 'store']
  );

  const storeResult = await db.query<{ id: string }>(
    'INSERT INTO stores (name, is_open, user_id) VALUES ($1, $2, $3) RETURNING id',
    ['My Store', false, store.rows[0].id]
  );

  const storeId = storeResult.rows[0].id;

  await db.query(
    'INSERT INTO products (name, price, store_id) VALUES ($1, $2, $3)',
    ['Hamburguesa Clásica', 15000, storeId]
  );
  await db.query(
    'INSERT INTO products (name, price, store_id) VALUES ($1, $2, $3)',
    ['Pizza Margherita', 28000, storeId]
  );
  await db.query(
    'INSERT INTO products (name, price, store_id) VALUES ($1, $2, $3)',
    ['Limonada Natural', 10000, storeId]
  );

  console.log('Seed users created:', consumer.rows[0].id, store.rows[0].id);
};
