import type { IWalletRepository } from '../../../src/application/interfaces/repositories/IWalletRepository';
import type { WalletBalance } from '../../../src/domain/entities/WalletBalance';
import type { CurrencyCode } from '../../../src/domain/enums/CurrencyCode';

/** Fake em memória do repositório da wallet para testes unitários. */
export class FakeWalletRepository implements IWalletRepository {
  private readonly store = new Map<string, WalletBalance>();

  private key(userId: string, currency: CurrencyCode): string {
    return `${userId}:${currency}`;
  }

  /** Semeia um saldo no store (para testes). */
  seed(balance: WalletBalance): void {
    this.store.set(this.key(balance.userId, balance.currency), balance);
  }

  async findByUser(userId: string): Promise<WalletBalance[]> {
    return [...this.store.values()].filter((b) => b.userId === userId);
  }

  async findByUserAndCurrency(
    userId: string,
    currency: CurrencyCode,
  ): Promise<WalletBalance | null> {
    return this.store.get(this.key(userId, currency)) ?? null;
  }

  async setListedAmount(
    userId: string,
    currency: CurrencyCode,
    amount: number,
  ): Promise<WalletBalance | null> {
    const current = this.store.get(this.key(userId, currency));
    if (!current) return null;
    const updated: WalletBalance = { ...current, listedAmount: amount, updatedAt: new Date() };
    this.store.set(this.key(userId, currency), updated);
    return updated;
  }

  async creditBalance(
    userId: string,
    currency: CurrencyCode,
    amount: number,
  ): Promise<WalletBalance> {
    const now = new Date();
    const existing = this.store.get(this.key(userId, currency));
    const updated: WalletBalance = existing
      ? { ...existing, balance: existing.balance + amount, updatedAt: now }
      : {
          id: `${userId}-${currency}`,
          userId,
          currency,
          balance: amount,
          listedAmount: 0,
          createdAt: now,
          updatedAt: now,
        };
    this.store.set(this.key(userId, currency), updated);
    return updated;
  }
}
