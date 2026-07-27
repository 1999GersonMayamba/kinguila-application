import { and, count, desc, eq, gte } from 'drizzle-orm';
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
import { walletBalances } from '../database/schema/walletBalances';
import { DrizzleGenericRepository } from './DrizzleGenericRepository';

function mapRow(row: OfferRow): Offer {
  return {
    id: row.id,
    sellerId: row.sellerId,
    sellCurrency: row.sellCurrency as CurrencyCode,
    buyCurrency: row.buyCurrency as CurrencyCode,
    // numeric chega como string do driver; converter para number no domínio.
    exchangeRate: Number(row.exchangeRate),
    minimumAmount: Number(row.minimumAmount),
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
      minimumAmount: data.minimumAmount?.toString(),
      status: data.status,
    }));
  }

  async listActive(filters: ListActiveFilters): Promise<{ items: Offer[]; total: number }> {
    // R9: a oferta só é visível se estiver `active` E o saldo exposto
    // (`listedAmount`) do vendedor na moeda de origem for >= ao mínimo da oferta.
    // R10: ofertas da mesma moeda partilham o mesmo `listedAmount` do vendedor,
    // logo o JOIN por (sellerId, sellCurrency) resolve a visibilidade de todas.
    const conditions = [
      eq(offers.status, 'active'),
      gte(walletBalances.listedAmount, offers.minimumAmount),
    ];
    if (filters.sellCurrency) {
      conditions.push(eq(offers.sellCurrency, filters.sellCurrency));
    }
    if (filters.buyCurrency) {
      conditions.push(eq(offers.buyCurrency, filters.buyCurrency));
    }
    const where = and(...conditions);
    const offset = (filters.page - 1) * filters.pageSize;

    // Condição de junção do saldo exposto: mesmo vendedor e mesma moeda de origem.
    const balanceJoin = and(
      eq(walletBalances.userId, offers.sellerId),
      eq(walletBalances.currency, offers.sellCurrency),
    );

    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(offers)
        .innerJoin(walletBalances, balanceJoin)
        .where(where)
        .orderBy(desc(offers.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      // A contagem TEM de usar exatamente o mesmo JOIN e condições, senão o total diverge.
      this.db
        .select({ value: count() })
        .from(offers)
        .innerJoin(walletBalances, balanceJoin)
        .where(where),
    ]);

    return { items: items.map((row) => mapRow(row.offers)), total: totalRows[0]?.value ?? 0 };
  }
}
