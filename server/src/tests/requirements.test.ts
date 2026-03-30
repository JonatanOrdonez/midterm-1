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
// Requerimiento 1 — Restricción de dominio @hotmail.es para stores
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 1: Restricción de dominio @hotmail.es para stores', () => {
  it('debe rechazar el registro de un store con correo @hotmail.es', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'usuario@hotmail.es',
      password: 'password123',
      role: 'store',
      store_name: 'Mi Tienda',
    });

    expect(res.body.message).toBe(
      'No está permitido registrar usuarios con el rol store con correo terminado en @hotmail.es'
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Requerimiento 2 — Nombre del producto mínimo 5 caracteres
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 2: Nombre del producto debe tener mínimo 5 caracteres', () => {
  it('debe rechazar un producto con nombre menor a 5 caracteres', async () => {
    const token = await login('store@email.com', '123456');
    const storeId = await getMyStoreId(token);

    const res = await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pan', price: 15000 });

    expect(res.body.message).toBe(
      'El nombre del producto debe tener al menos 5 caracteres'
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Requerimiento 3 — Solo productos con precio mayor a 5000
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 3: Solo se muestran productos con precio mayor a 5000', () => {
  it('no debe retornar productos con precio menor o igual a 5000', async () => {
    const token = await login('store@email.com', '123456');
    const storeId = await getMyStoreId(token);

    // Crear un producto con precio <= 5000
    await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Producto barato', price: 3000 });

    // Crear un producto con precio > 5000
    await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Producto caro', price: 15000 });

    // Al consultar la tienda, solo deben aparecer productos con precio > 5000
    const res = await request(app)
      .get(`/api/stores/${storeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const products = res.body.products;
    expect(products.length).toBeGreaterThan(0);
    products.forEach((product: { price: number }) => {
      expect(Number(product.price)).toBeGreaterThan(5000);
    });
  });
});
