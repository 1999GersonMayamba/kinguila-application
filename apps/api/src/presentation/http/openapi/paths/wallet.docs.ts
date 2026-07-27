import { apiRoutes } from '../../../../application/constants/apiRoutes';
import { currencyParamSchema, setListedAmountSchema } from '../../validators/wallet.validators';
import type { RegistryContext } from '../registry';
import {
  apiResponseSchema,
  errorResponseSchema,
  tags,
  walletBalanceResponseSchema,
} from '../schemas';
import { toOpenApiPath } from '../util';
import type { z } from '../zod';

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

/** Documenta as rotas da wallet. Acrescenta aqui ao criar uma rota da wallet. */
export function registerWalletDocs({ registry, bearerAuthName }: RegistryContext): void {
  registry.registerPath({
    method: 'get',
    path: apiRoutes.wallet.me,
    tags: [tags.wallet],
    summary: 'Saldos da wallet do utilizador autenticado',
    security: [{ [bearerAuthName]: [] }],
    responses: {
      200: {
        description: 'Saldos por moeda',
        ...json(apiResponseSchema(walletBalanceResponseSchema.array())),
      },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: toOpenApiPath(apiRoutes.wallet.setListedAmount),
    tags: [tags.wallet],
    summary: 'Definir o montante exposto para venda numa moeda',
    security: [{ [bearerAuthName]: [] }],
    request: { params: currencyParamSchema, body: json(setListedAmountSchema) },
    responses: {
      200: {
        description: 'Montante exposto atualizado',
        ...json(apiResponseSchema(walletBalanceResponseSchema)),
      },
      400: { description: 'Regra de negócio inválida', ...json(errorResponseSchema) },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });
}
