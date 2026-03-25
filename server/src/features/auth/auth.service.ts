import {
  AuthenticateUserDTO,
  CreateUserDTO,
  User,
  UserRole,
  UserWithPassword,
  UserWithToken,
} from './auth.types';
import Boom from '@hapi/boom';
import { db } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await db.query<User>(
    `SELECT id, email, role FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

const getUserWithPasswordByEmail = async (
  email: string
): Promise<UserWithPassword | null> => {
  const result = await db.query<UserWithPassword>(
    `SELECT id, email, role, password FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

const createUser = async (dto: CreateUserDTO): Promise<User> => {
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const result = await db.query<User>(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [dto.email, hashedPassword, dto.role]
  );

  return result.rows[0];
};

const createStoreForUser = async (userId: string, storeName: string) => {
  await db.query(
    'INSERT INTO stores (name, "isOpen", "userId") VALUES ($1, $2, $3)',
    [storeName, false, userId]
  );
};

const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const createUserService = async (
  dto: CreateUserDTO
): Promise<UserWithToken> => {
  const existing = await getUserByEmail(dto.email);

  if (existing) {
    throw Boom.conflict('Email already registered');
  }

  const user = await createUser(dto);

  if (dto.role === UserRole.STORE && dto.storeName) {
    await createStoreForUser(user.id, dto.storeName);
  }

  const token = generateToken(user);

  return { user, token };
};

export const authenticateUserService = async (
  credentials: AuthenticateUserDTO
): Promise<UserWithToken> => {
  const user = await getUserWithPasswordByEmail(credentials.email);

  if (!user) {
    throw Boom.unauthorized('Invalid credentials');
  }

  const valid = await bcrypt.compare(credentials.password, user.password);

  if (!valid) {
    throw Boom.unauthorized('Invalid credentials');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = user;
  const token = generateToken(userWithoutPassword);

  return { user: userWithoutPassword, token };
};
