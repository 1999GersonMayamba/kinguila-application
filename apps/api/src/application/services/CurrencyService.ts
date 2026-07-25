import type { CurrencyResponse, UpdateCurrencyRequest } from '@kinguila/contracts';
import type { Currency } from '../../domain/entities/Currency';
import type { CurrencyCode } from '../../domain/enums/CurrencyCode';
import { Response } from '../common/Response';
import type { ICurrencyRepository } from '../interfaces/repositories/ICurrencyRepository';
import type { ICurrencyService } from '../interfaces/services/ICurrencyService';

export class CurrencyService implements ICurrencyService {
  constructor(private readonly currencies: ICurrencyRepository) {}

  async listEnabled(): Promise<Response<CurrencyResponse[]>> {
    const items = await this.currencies.findAllEnabled();
    return Response.ok(items.map(this.toResponse));
  }

  async listAll(): Promise<Response<CurrencyResponse[]>> {
    const items = await this.currencies.findAll();
    return Response.ok(items.map(this.toResponse));
  }

  async getByCode(code: CurrencyCode): Promise<Response<CurrencyResponse>> {
    const currency = await this.currencies.findByCode(code);
    if (!currency) {
      return Response.notFound('Moeda não encontrada.');
    }
    return Response.ok(this.toResponse(currency));
  }

  async update(
    code: CurrencyCode,
    request: UpdateCurrencyRequest,
  ): Promise<Response<CurrencyResponse>> {
    const updated = await this.currencies.update(code, {
      name: request.name,
      symbol: request.symbol,
      icon: request.icon,
    });
    if (!updated) {
      return Response.notFound('Moeda não encontrada.');
    }
    return Response.ok(this.toResponse(updated), 'Moeda atualizada.');
  }

  async setEnabled(code: CurrencyCode, enabled: boolean): Promise<Response<CurrencyResponse>> {
    const updated = await this.currencies.setEnabled(code, enabled);
    if (!updated) {
      return Response.notFound('Moeda não encontrada.');
    }
    return Response.ok(this.toResponse(updated), enabled ? 'Moeda ativada.' : 'Moeda desativada.');
  }

  private toResponse(currency: Currency): CurrencyResponse {
    return {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      icon: currency.icon,
      enabled: currency.enabled,
    };
  }
}
