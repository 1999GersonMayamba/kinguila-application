import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';

/** Taxa de referência entre duas moedas, normalizada para o domínio. */
export interface ReferenceRate {
  base: CurrencyCode;
  quote: CurrencyCode;
  /** Quantas unidades de `quote` por 1 unidade de `base`. */
  rate: number;
  /** Momento em que a taxa foi obtida (ISO-8601). */
  fetchedAt: string;
}

/**
 * Contrato de um fornecedor de taxas de câmbio de referência. A Application
 * depende desta interface; a implementação concreta (HTTP) vive na infrastructure.
 * O fornecedor concreto pode ser trocado sem tocar na lógica de negócio.
 */
export interface IExchangeRateProvider {
  getReferenceRate(base: CurrencyCode, quote: CurrencyCode): Promise<ReferenceRate>;
}
