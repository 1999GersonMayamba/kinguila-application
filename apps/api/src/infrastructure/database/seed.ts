import { eq } from 'drizzle-orm';
import { env } from '../../config/env';
import { ROLE_ADMIN } from '../../domain/entities/Role';
import { PasswordHasher } from '../identity/PasswordHasher';
import { createDatabase } from './client';
import { currencies } from './schema/currencies';
import { users } from './schema/users';
import { walletBalances } from './schema/walletBalances';

/**
 * Popula dados de base. Idempotente: ignora conflitos.
 * Executar com: bun run db:seed
 *  - moedas suportadas
 *  - conta admin de bootstrap (R17) — só se ADMIN_EMAIL/ADMIN_PASSWORD estiverem definidos
 *  - saldos de wallet de teste para a conta admin (R8) — para demonstrar o fluxo sem funding
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

/**
 * Saldos de wallet de teste creditados à conta admin de bootstrap.
 * Permite demonstrar o fluxo de ofertas/ordens sem endpoint de crédito (funding deferido, R8).
 */
const TEST_WALLET_BALANCES = [
  { currency: 'EUR', balance: '5000.00', listedAmount: '3000.00' },
  { currency: 'USD', balance: '5000.00', listedAmount: '3000.00' },
  { currency: 'AOA', balance: '5000000.00', listedAmount: '3000000.00' },
  { currency: 'BRL', balance: '5000.00', listedAmount: '3000.00' },
];

/** Credita saldos de teste ao admin; idempotente pelo índice único (user_id, currency). */
async function seedWalletBalances(db: ReturnType<typeof createDatabase>): Promise<void> {
  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  if (!email || !env.ADMIN_PASSWORD) {
    console.log('ℹ️  Saldos: ADMIN_EMAIL/ADMIN_PASSWORD não definidos — ignorado.');
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const admin = existing[0];
  if (!admin) {
    console.log('ℹ️  Saldos: conta admin não encontrada — ignorado.');
    return;
  }

  await db
    .insert(walletBalances)
    .values(TEST_WALLET_BALANCES.map((b) => ({ userId: admin.id, ...b })))
    .onConflictDoNothing();
  console.log(`✅ Saldos: ${TEST_WALLET_BALANCES.length} garantidos para o admin.`);
}

async function seed() {
  const db = createDatabase();
  await seedCurrencies(db);
  await seedAdmin(db);
  await seedWalletBalances(db);
  console.log('✅ Seed concluído.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  });
