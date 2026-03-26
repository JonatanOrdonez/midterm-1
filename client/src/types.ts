export type UserRole = 'consumer' | 'store';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface UserWithToken {
  user: User;
  token: string;
}

export interface Store {
  id: string;
  name: string;
  is_open: boolean;
  user_id: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  store_id: string;
}

export interface StoreWithProducts extends Store {
  products: Product[];
}
