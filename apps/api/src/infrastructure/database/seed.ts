import { createDatabase } from './client';
import { currencies } from './schema/currencies';

/**
 * Popula as moedas suportadas. Idempotente: ignora conflitos por código.
 * Executar com: bun run db:seed
 */
const SUPPORTED_CURRENCIES = [
  { code: 'BRL', name: 'Real brasileiro', symbol: 'R$', enabled: true },
  { code: 'AOA', name: 'Kwanza angolano', symbol: 'Kz', enabled: true },
  { code: 'USD', name: 'Dólar americano', symbol: '$', enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
];

async function seed() {
  const db = createDatabase();
  await db.insert(currencies).values(SUPPORTED_CURRENCIES).onConflictDoNothing();
  console.log(`✅ Seed concluído: ${SUPPORTED_CURRENCIES.length} moedas garantidas.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  });
