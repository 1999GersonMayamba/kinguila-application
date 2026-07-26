import type { CurrencyCode } from './currency';

/** Saldo da wallet do utilizador numa moeda, exposto à UI. */
export interface WalletBalanceResponse {
  currency: CurrencyCode;
  /** Saldo real detido pelo utilizador na moeda. */
  balance: number;
  /** Montante exposto para venda (listado em ofertas); sempre ≤ balance. */
  listedAmount: number;
}

/** Define o montante exposto para venda numa moeda. */
export interface SetListedAmountRequest {
  listedAmount: number;
}
