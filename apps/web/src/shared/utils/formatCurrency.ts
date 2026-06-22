import type { CurrencyCode } from '@kinguila/contracts';

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  BRL: 'pt-BR',
  AOA: 'pt-AO',
  USD: 'en-US',
  EUR: 'pt-PT',
};

/** Formata um montante na moeda indicada (ex.: 1000000 AOA → "1 000 000,00 Kz"). */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? 'pt-PT', {
    style: 'currency',
    currency,
  }).format(amount);
}
