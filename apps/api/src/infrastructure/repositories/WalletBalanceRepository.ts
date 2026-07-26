import { and, eq, sql } from 'drizzle-orm';
import type { IWalletRepository } from '../../application/interfaces/repositories/IWalletRepository';
import type { WalletBalance } from '../../domain/entities/WalletBalance';
import type { CurrencyCode } from '../../domain/enums/CurrencyCode';
import type { Database } from '../database/client';
import { type WalletBalanceRow, walletBalances } from '../database/schema/walletBalances';

function mapRow(row: WalletBalanceRow): WalletBalance {
  return {
    id: row.id,
    userId: row.userId,
    currency: row.currency as CurrencyCode,
    // numeric chega como string do driver; converter para number no domínio.
    balance: Number(row.balance),
    listedAmount: Number(row.listedAmount),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * A tabela `wallet_balances` acede-se por `(user_id, currency)` (índice único),
 * por isso NÃO estende `DrizzleGenericRepository` (que assume acesso por `id`).
 */
export class WalletBalanceRepository implements IWalletRepository {
  constructor(private readonly db: Database) {}

  async findByUser(userId: string): Promise<WalletBalance[]> {
    const rows = await this.db
      .select()
      .from(walletBalances)
      .where(eq(walletBalances.userId, userId));
    return rows.map(mapRow);
  }

  async findByUserAndCurrency(
    userId: string,
    currency: CurrencyCode,
  ): Promise<WalletBalance | null> {
    const rows = await this.db
      .select()
      .from(walletBalances)
      .where(and(eq(walletBalances.userId, userId), eq(walletBalances.currency, currency)))
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async setListedAmount(
    userId: string,
    currency: CurrencyCode,
    amount: number,
  ): Promise<WalletBalance | null> {
    const rows = await this.db
      .update(walletBalances)
      .set({ listedAmount: amount.toString(), updatedAt: new Date() })
      .where(and(eq(walletBalances.userId, userId), eq(walletBalances.currency, currency)))
      .returning();
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async creditBalance(
    userId: string,
    currency: CurrencyCode,
    amount: number,
  ): Promise<WalletBalance> {
    const rows = await this.db
      .insert(walletBalances)
      .values({ userId, currency, balance: amount.toString() })
      .onConflictDoUpdate({
        target: [walletBalances.userId, walletBalances.currency],
        set: {
          balance: sql`${walletBalances.balance} + ${amount.toString()}::numeric`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return mapRow(rows[0] as WalletBalanceRow);
  }
}
