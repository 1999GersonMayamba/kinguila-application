import type { CurrencyCode } from '../enums/CurrencyCode';

/** Moeda transacionável na plataforma. */
export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  enabled: boolean;
}
