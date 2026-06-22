import type { CurrencyResponse } from '@kinguila/contracts';
import type { Currency } from '../../domain/entities/Currency';
import { Response } from '../common/Response';
import type { ICurrencyRepository } from '../interfaces/repositories/ICurrencyRepository';
import type { ICurrencyService } from '../interfaces/services/ICurrencyService';

export class CurrencyService implements ICurrencyService {
  constructor(private readonly currencies: ICurrencyRepository) {}

  async listEnabled(): Promise<Response<CurrencyResponse[]>> {
    const items = await this.currencies.findAllEnabled();
    return Response.ok(items.map(this.toResponse));
  }

  private toResponse(currency: Currency): CurrencyResponse {
    return {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      enabled: currency.enabled,
    };
  }
}
