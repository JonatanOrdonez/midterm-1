export enum UserRole {
  CONSUMER = 'consumer',
  STORE = 'store',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface UserWithToken {
  user: User;
  token: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
  store_name?: string;
}

export interface AuthenticateUserDTO {
  email: string;
  password: string;
}
