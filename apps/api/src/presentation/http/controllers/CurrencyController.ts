import type { SetCurrencyEnabledRequest, UpdateCurrencyRequest } from '@kinguila/contracts';
import { Response } from '../../../application/common/Response';
import type { ICurrencyService } from '../../../application/interfaces/services/ICurrencyService';
import { isCurrencyCode } from '../../../domain/enums/CurrencyCode';
import { toHttp } from '../helpers/toHttp';
import { validated } from '../middlewares/validate';
import type { AppContext } from '../types';

export class CurrencyController {
  constructor(private readonly currencyService: ICurrencyService) {}

  list = async (c: AppContext) => {
    return toHttp(c, await this.currencyService.listEnabled());
  };

  listAll = async (c: AppContext) => {
    return toHttp(c, await this.currencyService.listAll());
  };

  getByCode = async (c: AppContext) => {
    const code = c.req.param('code') ?? '';
    if (!isCurrencyCode(code)) {
      return toHttp(c, Response.notFound('Moeda não encontrada.'));
    }
    return toHttp(c, await this.currencyService.getByCode(code));
  };

  update = async (c: AppContext) => {
    const code = c.req.param('code') ?? '';
    if (!isCurrencyCode(code)) {
      return toHttp(c, Response.notFound('Moeda não encontrada.'));
    }
    const body = validated<UpdateCurrencyRequest>(c);
    return toHttp(c, await this.currencyService.update(code, body));
  };

  setEnabled = async (c: AppContext) => {
    const code = c.req.param('code') ?? '';
    if (!isCurrencyCode(code)) {
      return toHttp(c, Response.notFound('Moeda não encontrada.'));
    }
    const body = validated<SetCurrencyEnabledRequest>(c);
    return toHttp(c, await this.currencyService.setEnabled(code, body.enabled));
  };
}
