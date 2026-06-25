import { eq } from 'drizzle-orm';
import { env } from '../../config/env';
import { ROLE_ADMIN } from '../../domain/entities/Role';
import { PasswordHasher } from '../identity/PasswordHasher';
import { createDatabase } from './client';
import { currencies } from './schema/currencies';
import { users } from './schema/users';

/**
 * Popula dados de base. Idempotente: ignora conflitos.
 * Executar com: bun run db:seed
 *  - moedas suportadas
 *  - conta admin de bootstrap (R17) — só se ADMIN_EMAIL/ADMIN_PASSWORD estiverem definidos
 */
const SUPPORTED_CURRENCIES = [
  { code: 'BRL', name: 'Real brasileiro', symbol: 'R$', enabled: true },
  { code: 'AOA', name: 'Kwanza angolano', symbol: 'Kz', enabled: true },
  { code: 'USD', name: 'Dólar americano', symbol: '$', enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
];

async function seedCurrencies(db: ReturnType<typeof createDatabase>): Promise<void> {
  await db.insert(currencies).values(SUPPORTED_CURRENCIES).onConflictDoNothing();
  console.log(`✅ Moedas: ${SUPPORTED_CURRENCIES.length} garantidas.`);
}

/** Cria a conta admin se ainda não existir (bootstrap; não há outro caminho para admin). */
async function seedAdmin(db: ReturnType<typeof createDatabase>): Promise<void> {
  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  if (!email || !env.ADMIN_PASSWORD) {
    console.log('ℹ️  Admin: ADMIN_EMAIL/ADMIN_PASSWORD não definidos — ignorado.');
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log('ℹ️  Admin: conta já existe — ignorado.');
    return;
  }

  const passwordHash = await new PasswordHasher().hash(env.ADMIN_PASSWORD);
  await db.insert(users).values({
    name: 'Administrador',
    email,
    passwordHash,
    roles: [ROLE_ADMIN],
    emailConfirmedAt: new Date(),
  });
  console.log(`✅ Admin: conta criada (${email}).`);
}

async function seed() {
  const db = createDatabase();
  await seedCurrencies(db);
  await seedAdmin(db);
  console.log('✅ Seed concluído.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  });
