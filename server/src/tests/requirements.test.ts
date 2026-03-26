import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../config/database';
import { initDb } from '../config/initDb';

// Reset the database before each test for isolation
beforeEach(async () => {
  await initDb();
});

// ─────────────────────────────────────────────────────────────
// Helper: login and return token
// ─────────────────────────────────────────────────────────────
async function login(email: string, password: string): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

async function getMyStoreId(token: string): Promise<string> {
  const res = await request(app)
    .get('/api/stores/mine')
    .set('Authorization', `Bearer ${token}`);
  return res.body.id;
}

// ─────────────────────────────────────────────────────────────
// Requerimiento 1 — Restricción de dominio @gmail.com
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 1: Restricción de dominio @gmail.com para consumidores', () => {
  it('debe rechazar el registro de un consumer con correo @gmail.com', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'usuario@gmail.com',
      password: 'password123',
      role: 'consumer',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'No está permitido registrar usuarios con el rol consumer con correo terminado en @gmail.com'
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Requerimiento 2 — Precio mínimo de producto >= 10.000
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 2: Precio mínimo del producto debe ser >= 10.000', () => {
  it('debe rechazar un producto con precio menor a 10.000', async () => {
    const token = await login('store@email.com', '123456');
    const storeId = await getMyStoreId(token);

    const res = await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Producto barato', price: 5000 });

    expect(res.body.message).toBe(
      'El precio del producto debe ser mayor o igual a 10.000'
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Requerimiento 3 — Solo tiendas abiertas para consumers
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 3: Consumidores solo ven tiendas abiertas', () => {
  it('No debe retornar tiendas cerradas al consumidor', async () => {
    const storeToken = await login('store@email.com', '123456');
    const storeId = await getMyStoreId(storeToken);

    // Cerrar la tienda explícitamente
    await request(app)
      .patch(`/api/stores/${storeId}`)
      .set('Authorization', `Bearer ${storeToken}`)
      .send({ is_open: false });

    // El consumer no debería ver ninguna tienda
    const consumerToken = await login('customer@email.com', '123456');
    const res = await request(app)
      .get('/api/stores')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});
