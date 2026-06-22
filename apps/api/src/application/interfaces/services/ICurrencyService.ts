import type { CurrencyResponse } from '@kinguila/contracts';
import type { Response } from '../../common/Response';

export interface ICurrencyService {
  listEnabled(): Promise<Response<CurrencyResponse[]>>;
}
