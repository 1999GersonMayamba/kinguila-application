import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../config/env';
import * as schema from './schema';

/**
 * Cria a ligação ao PostgreSQL e o cliente Drizzle. Instanciado uma única vez
 * no composition root e injetado nos repositórios.
 */
export function createDatabase() {
  const queryClient = postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 5,
  });
  return drizzle(queryClient, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
