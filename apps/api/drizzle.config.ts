import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

/**
 * Configuração do Drizzle Kit (geração e aplicação de migrations).
 * Migrations são SEMPRE manuais — ver .claude/skills/run-migrations.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/index.ts',
  out: './src/infrastructure/database/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
