import { eq } from 'drizzle-orm';
import type {
  CurrencyUpdate,
  ICurrencyRepository,
} from '../../application/interfaces/repositories/ICurrencyRepository';
import type { Currency } from '../../domain/entities/Currency';
import type { CurrencyCode } from '../../domain/enums/CurrencyCode';
import type { Database } from '../database/client';
import { type CurrencyRow, currencies } from '../database/schema/currencies';

function mapRow(row: CurrencyRow): Currency {
  return {
    code: row.code as CurrencyCode,
    name: row.name,
    symbol: row.symbol,
    icon: row.icon,
    enabled: row.enabled,
  };
}

/**
 * A tabela `currencies` tem `code` como PK e não tem `id`/timestamps, por isso
 * NÃO estende `DrizzleGenericRepository` (que assume `id` e injeta `updatedAt`).
 */
export class CurrencyRepository implements ICurrencyRepository {
  constructor(private readonly db: Database) {}

  async findAllEnabled(): Promise<Currency[]> {
    const rows = await this.db.select().from(currencies).where(eq(currencies.enabled, true));
    return rows.map(mapRow);
  }

  async findAll(): Promise<Currency[]> {
    const rows = await this.db.select().from(currencies);
    return rows.map(mapRow);
  }

  async findByCode(code: CurrencyCode): Promise<Currency | null> {
    const rows = await this.db.select().from(currencies).where(eq(currencies.code, code)).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async update(code: CurrencyCode, data: CurrencyUpdate): Promise<Currency | null> {
    const rows = await this.db
      .update(currencies)
      .set({ name: data.name, symbol: data.symbol, icon: data.icon })
      .where(eq(currencies.code, code))
      .returning();
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async setEnabled(code: CurrencyCode, enabled: boolean): Promise<Currency | null> {
    const rows = await this.db
      .update(currencies)
      .set({ enabled })
      .where(eq(currencies.code, code))
      .returning();
    const row = rows[0];
    return row ? mapRow(row) : null;
  }
}
