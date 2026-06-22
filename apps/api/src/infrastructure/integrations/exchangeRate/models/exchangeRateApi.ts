/**
 * Modelos CRUS da API do fornecedor de taxas de câmbio. Refletem o formato exato
 * do fornecedor e NÃO saem desta pasta — são mapeados para os tipos do domínio
 * (`ReferenceRate`) dentro do `ExchangeRateClient`.
 */
export interface ExchangeRateApiRateResponse {
  base: string;
  target: string;
  rate: number;
  /** Epoch em segundos. */
  timestamp: number;
}
