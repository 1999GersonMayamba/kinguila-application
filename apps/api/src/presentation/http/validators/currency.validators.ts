import { z } from 'zod';
import { CURRENCY_CODES } from '../../../domain/enums/CurrencyCode';

/** Ícone: string curta (chave/URL), sem markup (`<`/`>`) para evitar XSS. */
const iconSchema = z
  .string()
  .max(2048, 'Ícone demasiado longo')
  .refine((value) => !/[<>]/.test(value), 'O ícone não pode conter markup')
  .nullable();

export const updateCurrencySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    symbol: z.string().min(1).max(8).optional(),
    icon: iconSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Indica pelo menos um campo para atualizar',
  });

export const setCurrencyEnabledSchema = z.object({
  enabled: z.boolean(),
});

/** Parâmetro de path `:code` validado contra o enum de moedas. */
export const currencyCodeParamSchema = z.object({
  code: z.enum(CURRENCY_CODES),
});
