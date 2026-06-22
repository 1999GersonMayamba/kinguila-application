import { CURRENCY_CODES } from '../../../domain/enums/CurrencyCode';
import { OFFER_STATUSES } from '../../../domain/enums/OfferStatus';
import { z } from './zod';

/** Tags (agrupam as rotas na Swagger UI). */
export const tags = {
  auth: 'Auth',
  currencies: 'Currencies',
  offers: 'Offers',
} as const;

/** Envelope padrão `ApiResponse<T>` para um dado tipo de `data`. */
export function apiResponseSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    succeeded: z.boolean(),
    message: z.string(),
    data: data.nullable(),
    errors: z.array(z.string()),
  });
}

/** Envelope de erro (data sempre null). Reutilizável em respostas 4xx/5xx. */
export const errorResponseSchema = apiResponseSchema(z.null());

// --- Schemas de resposta (espelham packages/contracts; é a camada de documentação) ---

export const currencyResponseSchema = z
  .object({
    code: z.enum(CURRENCY_CODES),
    name: z.string(),
    symbol: z.string(),
    enabled: z.boolean(),
  })
  .openapi('CurrencyResponse');

export const offerResponseSchema = z
  .object({
    id: z.string().uuid(),
    sellerId: z.string().uuid(),
    sellCurrency: z.enum(CURRENCY_CODES),
    buyCurrency: z.enum(CURRENCY_CODES),
    exchangeRate: z.number(),
    availableAmount: z.number(),
    status: z.enum(OFFER_STATUSES),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('OfferResponse');

export const pagedOfferResponseSchema = z
  .object({
    items: z.array(offerResponseSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .openapi('PagedOfferResponse');

export const authResponseSchema = z
  .object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      roles: z.array(z.string()),
    }),
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
  })
  .openapi('AuthResponse');

export const authUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    roles: z.array(z.string()),
  })
  .openapi('AuthUser');

/** Schema dos parâmetros de path com `:id`. */
export const idParamSchema = z.object({
  id: z.string().uuid(),
});
