import type { WalletBalance } from '../../../domain/entities/WalletBalance';
import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';

/**
 * Acesso aos saldos da wallet por `(userId, currency)`. Não estende o repositório
 * genérico: o acesso natural é por utilizador+moeda, não por `id`.
 */
export interface IWalletRepository {
  /** Todos os saldos (por moeda) de um utilizador. */
  findByUser(userId: string): Promise<WalletBalance[]>;
  /** Saldo de um utilizador numa moeda, ou null se não existir. */
  findByUserAndCurrency(userId: string, currency: CurrencyCode): Promise<WalletBalance | null>;
  /** Define o montante exposto para venda; devolve o saldo atualizado ou null se não existir. */
  setListedAmount(
    userId: string,
    currency: CurrencyCode,
    amount: number,
  ): Promise<WalletBalance | null>;
  /** Credita saldo (upsert por utilizador+moeda; soma ao existente). Usado por seed/admin. */
  creditBalance(userId: string, currency: CurrencyCode, amount: number): Promise<WalletBalance>;
}
