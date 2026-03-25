export interface Store {
  id: string;
  name: string;
  isOpen: boolean;
  userId: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  storeId: string;
}

export interface StoreWithProducts extends Store {
  products: Product[];
}

export interface CreateProductDTO {
  name: string;
  price: number;
  storeId: string;
  userId: string;
}
