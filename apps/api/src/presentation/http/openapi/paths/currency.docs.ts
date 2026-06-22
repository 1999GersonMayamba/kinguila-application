import { apiRoutes } from '../../../../application/constants/apiRoutes';
import type { RegistryContext } from '../registry';
import { apiResponseSchema, currencyResponseSchema, tags } from '../schemas';
import { z } from '../zod';

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

/** Documenta as rotas de moedas. */
export function registerCurrencyDocs({ registry }: RegistryContext): void {
  registry.registerPath({
    method: 'get',
    path: apiRoutes.currencies.list,
    tags: [tags.currencies],
    summary: 'Listar moedas suportadas',
    responses: {
      200: {
        description: 'Lista de moedas',
        ...json(apiResponseSchema(z.array(currencyResponseSchema))),
      },
    },
  });
}
