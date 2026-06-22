/** Códigos de moeda suportados (ISO-4217). Persistidos como texto. */
export const CURRENCY_CODES = ['BRL', 'AOA', 'USD', 'EUR'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}
