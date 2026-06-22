import type { ICurrencyService } from '../../../application/interfaces/services/ICurrencyService';
import { toHttp } from '../helpers/toHttp';
import type { AppContext } from '../types';

export class CurrencyController {
  constructor(private readonly currencyService: ICurrencyService) {}

  list = async (c: AppContext) => {
    return toHttp(c, await this.currencyService.listEnabled());
  };
}
