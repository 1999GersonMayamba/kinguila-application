import type {
  IExchangeRateProvider,
  ReferenceRate,
} from '../../../application/interfaces/integrations/IExchangeRateProvider';
import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';
import { HttpIntegrationClient } from '../shared/HttpIntegrationClient';
import type { ExchangeRateApiRateResponse } from './models/exchangeRateApi';

/**
 * Integração de REFERÊNCIA. Cliente HTTP tipado para um fornecedor de taxas de
 * câmbio. Demonstra o padrão completo: estende `HttpIntegrationClient`, implementa
 * a interface da Application e mapeia a resposta crua do fornecedor para o modelo
 * do domínio. Copia esta estrutura ao adicionar fornecedores (pagamentos, KYC...).
 */
export class ExchangeRateClient extends HttpIntegrationClient implements IExchangeRateProvider {
  constructor(baseUrl: string, apiKey: string) {
    super('exchange-rate', {
      baseUrl,
      // Auth conforme o fornecedor: aqui um header de API key (pode ser Bearer, etc.).
      defaultHeaders: apiKey ? { 'X-Api-Key': apiKey } : {},
      timeoutMs: 8_000,
    });
  }

  async getReferenceRate(base: CurrencyCode, quote: CurrencyCode): Promise<ReferenceRate> {
    const raw = await this.get<ExchangeRateApiRateResponse>('/v1/rates', {
      query: { base, target: quote },
    });

    // Mapeia o formato cru do fornecedor para o modelo do domínio.
    return {
      base,
      quote,
      rate: raw.rate,
      fetchedAt: new Date(raw.timestamp * 1000).toISOString(),
    };
  }
}
