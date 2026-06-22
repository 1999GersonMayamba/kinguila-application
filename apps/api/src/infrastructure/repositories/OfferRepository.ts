import { and, count, desc, eq } from 'drizzle-orm';
import type {
  IOfferRepository,
  ListActiveFilters,
  OfferInsert,
} from '../../application/interfaces/repositories/IOfferRepository';
import type { Offer } from '../../domain/entities/Offer';
import type { CurrencyCode } from '../../domain/enums/CurrencyCode';
import type { OfferStatus } from '../../domain/enums/OfferStatus';
import type { Database } from '../database/client';
import { type OfferRow, offers } from '../database/schema/offers';
import { DrizzleGenericRepository } from './DrizzleGenericRepository';

function mapRow(row: OfferRow): Offer {
  return {
    id: row.id,
    sellerId: row.sellerId,
    sellCurrency: row.sellCurrency as CurrencyCode,
    buyCurrency: row.buyCurrency as CurrencyCode,
    // numeric chega como string do driver; converter para number no domínio.
    exchangeRate: Number(row.exchangeRate),
    availableAmount: Number(row.availableAmount),
    status: row.status as OfferStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class OfferRepository
  extends DrizzleGenericRepository<Offer, OfferInsert, typeof offers>
  implements IOfferRepository
{
  constructor(db: Database) {
    super(db, offers, mapRow, (data) => ({
      sellerId: data.sellerId,
      sellCurrency: data.sellCurrency,
      buyCurrency: data.buyCurrency,
      // numeric do Drizzle aceita string; converter de number.
      exchangeRate: data.exchangeRate?.toString(),
      availableAmount: data.availableAmount?.toString(),
      status: data.status,
    }));
  }

  async listActive(filters: ListActiveFilters): Promise<{ items: Offer[]; total: number }> {
    const conditions = [eq(offers.status, 'active')];
    if (filters.sellCurrency) {
      conditions.push(eq(offers.sellCurrency, filters.sellCurrency));
    }
    if (filters.buyCurrency) {
      conditions.push(eq(offers.buyCurrency, filters.buyCurrency));
    }
    const where = and(...conditions);
    const offset = (filters.page - 1) * filters.pageSize;

    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(offers)
        .where(where)
        .orderBy(desc(offers.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db.select({ value: count() }).from(offers).where(where),
    ]);

    return { items: items.map(mapRow), total: totalRows[0]?.value ?? 0 };
  }
}
