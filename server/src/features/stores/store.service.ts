import {
  CreateProductDTO,
  Product,
  Store,
  StoreWithProducts,
} from './store.types';
import Boom from '@hapi/boom';
import { db } from '../../config/database';

export const getStoresService = async (): Promise<Store[]> => {
  const result = await db.query<Store>(
    'SELECT id, name, is_open, user_id FROM stores'
  );
  return result.rows;
};

export const getStoreByIdService = async (
  storeId: string,
  userId?: string
): Promise<Store> => {
  let query = `SELECT id, name, is_open, user_id FROM stores WHERE id = $1`;
  const params: string[] = [storeId];

  if (userId) {
    query += ' AND user_id = $2';
    params.push(userId);
  }

  const result = await db.query<Store>(query, params);

  if (result.rows.length === 0) {
    throw Boom.notFound('Store not found');
  }

  return result.rows[0];
};

export const getProductsByStoreIdService = async (
  storeId: string
): Promise<Product[]> => {
  const result = await db.query<Product>(
    'SELECT id, name, price, store_id FROM products WHERE store_id = $1',
    [storeId]
  );
  return result.rows;
};

export const getStoreWithProductsByIdService = async (
  storeId: string
): Promise<StoreWithProducts> => {
  const store = await getStoreByIdService(storeId);
  const products = await getProductsByStoreIdService(storeId);
  return { ...store, products };
};

export const getStoreByUserIdService = async (
  userId: string
): Promise<Store> => {
  const result = await db.query<Store>(
    'SELECT id, name, is_open, user_id FROM stores WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    throw Boom.notFound('Store not found');
  }
  return result.rows[0];
};

export const updateStoreIsOpenService = async (
  storeId: string,
  is_open: boolean,
  userId: string
): Promise<Store> => {
  const store = await getStoreByIdService(storeId);
  if (store.user_id !== userId) {
    throw Boom.forbidden('You do not have permission to update this store');
  }
  const result = await db.query<Store>(
    'UPDATE stores SET is_open = $1 WHERE id = $2 RETURNING id, name, is_open, user_id',
    [is_open, storeId]
  );
  return result.rows[0];
};

export const deleteProductService = async (
  productId: string,
  userId: string
): Promise<void> => {
  const productResult = await db.query<Product>(
    'SELECT id, store_id FROM products WHERE id = $1',
    [productId]
  );
  if (productResult.rows.length === 0) {
    throw Boom.notFound('Product not found');
  }
  const { store_id } = productResult.rows[0];
  await getStoreByIdService(store_id, userId);
  await db.query('DELETE FROM products WHERE id = $1', [productId]);
};

export const createProductService = async (
  product: CreateProductDTO
): Promise<Product> => {
  const { name, price, store_id, user_id } = product;

  const store = await getStoreByIdService(store_id);

  if (store.user_id !== user_id) {
    throw Boom.forbidden(
      'You do not have permission to add products to this store'
    );
  }

  const result = await db.query<Product>(
    'INSERT INTO products (name, price, store_id) VALUES ($1, $2, $3) RETURNING id, name, price, store_id',
    [name, price, store_id]
  );

  return result.rows[0];
};
