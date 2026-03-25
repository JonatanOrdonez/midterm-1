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
    'SELECT id, name, "isOpen", "userId" FROM stores'
  );
  return result.rows;
};

export const getStoreByIdService = async (
  storeId: string,
  userId?: string
): Promise<Store> => {
  let query = `SELECT id, name, "isOpen", "userId" FROM stores WHERE id = $1`;
  const params: string[] = [storeId];

  if (userId) {
    query += ' AND "userId" = $2';
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
    'SELECT id, name, price, "storeId" FROM products WHERE "storeId" = $1',
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

export const getStoreByUserIdService = async (userId: string): Promise<Store> => {
  const result = await db.query<Store>(
    'SELECT id, name, "isOpen", "userId" FROM stores WHERE "userId" = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    throw Boom.notFound('Store not found');
  }
  return result.rows[0];
};

export const updateStoreIsOpenService = async (
  storeId: string,
  isOpen: boolean,
  userId: string
): Promise<Store> => {
  const store = await getStoreByIdService(storeId);
  if (store.userId !== userId) {
    throw Boom.forbidden('You do not have permission to update this store');
  }
  const result = await db.query<Store>(
    'UPDATE stores SET "isOpen" = $1 WHERE id = $2 RETURNING id, name, "isOpen", "userId"',
    [isOpen, storeId]
  );
  return result.rows[0];
};

export const deleteProductService = async (
  productId: string,
  userId: string
): Promise<void> => {
  const productResult = await db.query<Product>(
    'SELECT id, "storeId" FROM products WHERE id = $1',
    [productId]
  );
  if (productResult.rows.length === 0) {
    throw Boom.notFound('Product not found');
  }
  const { storeId } = productResult.rows[0];
  await getStoreByIdService(storeId, userId);
  await db.query('DELETE FROM products WHERE id = $1', [productId]);
};

export const createProductService = async (
  product: CreateProductDTO
): Promise<Product> => {
  const { name, price, storeId, userId } = product;

  const store = await getStoreByIdService(storeId);

  if (store.userId !== userId) {
    throw Boom.forbidden(
      'You do not have permission to add products to this store'
    );
  }

  const result = await db.query<Product>(
    'INSERT INTO products (name, price, "storeId") VALUES ($1, $2, $3) RETURNING id, name, price, "storeId"',
    [name, price, storeId]
  );

  return result.rows[0];
};
