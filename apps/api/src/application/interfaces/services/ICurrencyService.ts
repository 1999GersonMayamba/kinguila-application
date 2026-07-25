import type { CurrencyResponse, UpdateCurrencyRequest } from '@kinguila/contracts';
import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';
import type { Response } from '../../common/Response';

export interface ICurrencyService {
  /** Lista apenas as moedas ativas (uso público — compatibilidade). */
  listEnabled(): Promise<Response<CurrencyResponse[]>>;
  /** Lista todas as moedas, incluindo desativadas (gestão). */
  listAll(): Promise<Response<CurrencyResponse[]>>;
  getByCode(code: CurrencyCode): Promise<Response<CurrencyResponse>>;
  update(code: CurrencyCode, request: UpdateCurrencyRequest): Promise<Response<CurrencyResponse>>;
  setEnabled(code: CurrencyCode, enabled: boolean): Promise<Response<CurrencyResponse>>;
}
