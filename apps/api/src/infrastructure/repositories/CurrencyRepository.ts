import { eq } from 'drizzle-orm';
import type { ICurrencyRepository } from '../../application/interfaces/repositories/ICurrencyRepository';
import type { Currency } from '../../domain/entities/Currency';
import type { CurrencyCode } from '../../domain/enums/CurrencyCode';
import type { Database } from '../database/client';
import { type CurrencyRow, currencies } from '../database/schema/currencies';

function mapRow(row: CurrencyRow): Currency {
  return {
    code: row.code as CurrencyCode,
    name: row.name,
    symbol: row.symbol,
    enabled: row.enabled,
  };
}

export class CurrencyRepository implements ICurrencyRepository {
  constructor(private readonly db: Database) {}

  async findAllEnabled(): Promise<Currency[]> {
    const rows = await this.db.select().from(currencies).where(eq(currencies.enabled, true));
    return rows.map(mapRow);
  }

  async findByCode(code: CurrencyCode): Promise<Currency | null> {
    const rows = await this.db.select().from(currencies).where(eq(currencies.code, code)).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }
}
