import { z } from 'zod';
import { CURRENCY_CODES } from '../../../domain/enums/CurrencyCode';

const currencyCode = z.enum(CURRENCY_CODES);

export const createOfferSchema = z.object({
  sellCurrency: currencyCode,
  buyCurrency: currencyCode,
  exchangeRate: z.number().positive('A taxa tem de ser maior que zero'),
  availableAmount: z.number().positive('O montante tem de ser maior que zero'),
});

export const updateOfferSchema = z
  .object({
    exchangeRate: z.number().positive().optional(),
    availableAmount: z.number().positive().optional(),
    status: z.enum(['active', 'paused', 'cancelled']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Indica pelo menos um campo para atualizar',
  });

export const listOffersQuerySchema = z.object({
  sellCurrency: currencyCode.optional(),
  buyCurrency: currencyCode.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});
