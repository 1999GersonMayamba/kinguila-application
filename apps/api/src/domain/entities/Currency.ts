import type { CurrencyCode } from '../enums/CurrencyCode';

/** Moeda transacionável na plataforma. */
export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  /** Chave de ícone ou URL (string curta); nunca markup. Opcional. */
  icon: string | null;
  enabled: boolean;
}
