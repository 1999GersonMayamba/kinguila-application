import { apiRoutes } from '../../../../application/constants/apiRoutes';
import {
  currencyCodeParamSchema,
  setCurrencyEnabledSchema,
  updateCurrencySchema,
} from '../../validators/currency.validators';
import type { RegistryContext } from '../registry';
import { apiResponseSchema, currencyResponseSchema, errorResponseSchema, tags } from '../schemas';
import { toOpenApiPath } from '../util';
import type { z } from '../zod';

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

/** Documenta as rotas de moedas. Acrescenta aqui ao criar uma rota de moeda. */
export function registerCurrencyDocs({ registry, bearerAuthName }: RegistryContext): void {
  registry.registerPath({
    method: 'get',
    path: apiRoutes.currencies.list,
    tags: [tags.currencies],
    summary: 'Listar moedas ativas',
    responses: {
      200: {
        description: 'Moedas ativas',
        ...json(apiResponseSchema(currencyResponseSchema.array())),
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: apiRoutes.currencies.listAll,
    tags: [tags.currencies],
    summary: 'Listar todas as moedas, incl. desativadas (gestão)',
    security: [{ [bearerAuthName]: [] }],
    responses: {
      200: {
        description: 'Todas as moedas',
        ...json(apiResponseSchema(currencyResponseSchema.array())),
      },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'get',
    path: toOpenApiPath(apiRoutes.currencies.byCode),
    tags: [tags.currencies],
    summary: 'Detalhe de uma moeda',
    request: { params: currencyCodeParamSchema },
    responses: {
      200: { description: 'Moeda', ...json(apiResponseSchema(currencyResponseSchema)) },
      404: { description: 'Não encontrada', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'put',
    path: toOpenApiPath(apiRoutes.currencies.update),
    tags: [tags.currencies],
    summary: 'Editar uma moeda (nome/símbolo/ícone)',
    security: [{ [bearerAuthName]: [] }],
    request: { params: currencyCodeParamSchema, body: json(updateCurrencySchema) },
    responses: {
      200: { description: 'Moeda atualizada', ...json(apiResponseSchema(currencyResponseSchema)) },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
      404: { description: 'Não encontrada', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: toOpenApiPath(apiRoutes.currencies.setEnabled),
    tags: [tags.currencies],
    summary: 'Ativar/desativar uma moeda (soft-delete)',
    security: [{ [bearerAuthName]: [] }],
    request: { params: currencyCodeParamSchema, body: json(setCurrencyEnabledSchema) },
    responses: {
      200: { description: 'Estado atualizado', ...json(apiResponseSchema(currencyResponseSchema)) },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
      404: { description: 'Não encontrada', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });
}
