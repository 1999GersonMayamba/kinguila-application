import type { CurrencyCode } from '../enums/CurrencyCode';

/**
 * Saldo de um utilizador numa dada moeda. Regista o saldo real detido e o
 * montante que está exposto para venda (listado em ofertas). `listedAmount`
 * nunca deve exceder `balance`.
 */
export interface WalletBalance {
  id: string;
  userId: string;
  currency: CurrencyCode;
  /** Saldo real detido pelo utilizador na moeda. */
  balance: number;
  /** Montante exposto para venda (listado em ofertas); sempre ≤ balance. */
  listedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
