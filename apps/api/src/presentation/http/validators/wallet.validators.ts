import { z } from 'zod';
import { CURRENCY_CODES } from '../../../domain/enums/CurrencyCode';

export const setListedAmountSchema = z.object({
  listedAmount: z.number().nonnegative('O montante exposto não pode ser negativo'),
});

/** Parâmetro de path `:currency` validado contra o enum de moedas. */
export const currencyParamSchema = z.object({
  currency: z.enum(CURRENCY_CODES),
});
