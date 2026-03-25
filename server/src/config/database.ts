import { PGlite } from '@electric-sql/pglite';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../db');

export const db = new PGlite(DB_PATH);
