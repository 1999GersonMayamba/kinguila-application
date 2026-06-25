/** Códigos de moeda suportados (ISO-4217). */
export type CurrencyCode = 'BRL' | 'AOA' | 'USD' | 'EUR';

export interface CurrencyResponse {
  code: CurrencyCode;
  name: string;
  symbol: string;
  icon: string | null;
  enabled: boolean;
}

/** Edição de uma moeda existente (o `code` é imutável). Pelo menos um campo. */
export interface UpdateCurrencyRequest {
  name?: string;
  symbol?: string;
  icon?: string | null;
}

/** Ativa/desativa uma moeda (soft-delete). */
export interface SetCurrencyEnabledRequest {
  enabled: boolean;
}
