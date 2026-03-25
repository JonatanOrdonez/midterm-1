import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { authenticateUserService, createUserService } from './auth.service';
import { UserRole } from './auth.types';

export const authenticateUserController = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;

  if (!email) throw Boom.badRequest('Email is required');
  if (!password) throw Boom.badRequest('Password is required');

  const data = await authenticateUserService({ email, password });
  return res.json(data);
};

export const createUserController = async (req: Request, res: Response) => {
  const { email, password, role, storeName } = req.body;

  if (!email) throw Boom.badRequest('Email is required');
  if (!password) throw Boom.badRequest('Password is required');
  if (!Object.values(UserRole).includes(role)) {
    throw Boom.badRequest(
      `Role must be one of: ${Object.values(UserRole).join(', ')}`
    );
  }
  if (role === UserRole.STORE && !storeName) {
    throw Boom.badRequest('storeName is required for store role');
  }

  const data = await createUserService({ email, password, role, storeName });
  return res.status(201).json(data);
};
