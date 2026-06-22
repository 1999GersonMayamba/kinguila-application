/** Códigos de moeda suportados (ISO-4217). */
export type CurrencyCode = 'BRL' | 'AOA' | 'USD' | 'EUR';

export interface CurrencyResponse {
  code: CurrencyCode;
  name: string;
  symbol: string;
  enabled: boolean;
}
