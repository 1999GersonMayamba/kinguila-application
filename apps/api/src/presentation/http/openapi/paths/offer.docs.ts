import { apiRoutes } from '../../../../application/constants/apiRoutes';
import {
  createOfferSchema,
  listOffersQuerySchema,
  updateOfferSchema,
} from '../../validators/offer.validators';
import type { RegistryContext } from '../registry';
import {
  apiResponseSchema,
  errorResponseSchema,
  idParamSchema,
  offerResponseSchema,
  pagedOfferResponseSchema,
  tags,
} from '../schemas';
import { toOpenApiPath } from '../util';
import type { z } from '../zod';

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

/** Documenta as rotas de ofertas. Acrescenta aqui ao criar uma rota de oferta. */
export function registerOfferDocs({ registry, bearerAuthName }: RegistryContext): void {
  registry.registerPath({
    method: 'get',
    path: apiRoutes.offers.list,
    tags: [tags.offers],
    summary: 'Listar ofertas ativas (com filtros)',
    request: { query: listOffersQuerySchema },
    responses: {
      200: { description: 'Ofertas', ...json(apiResponseSchema(pagedOfferResponseSchema)) },
    },
  });

  registry.registerPath({
    method: 'get',
    path: toOpenApiPath(apiRoutes.offers.getById),
    tags: [tags.offers],
    summary: 'Detalhe de uma oferta',
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Oferta', ...json(apiResponseSchema(offerResponseSchema)) },
      404: { description: 'Não encontrada', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.offers.create,
    tags: [tags.offers],
    summary: 'Criar oferta',
    security: [{ [bearerAuthName]: [] }],
    request: { body: json(createOfferSchema) },
    responses: {
      201: { description: 'Oferta criada', ...json(apiResponseSchema(offerResponseSchema)) },
      400: { description: 'Regra de negócio inválida', ...json(errorResponseSchema) },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'put',
    path: toOpenApiPath(apiRoutes.offers.update),
    tags: [tags.offers],
    summary: 'Atualizar oferta (apenas o dono)',
    security: [{ [bearerAuthName]: [] }],
    request: { params: idParamSchema, body: json(updateOfferSchema) },
    responses: {
      200: { description: 'Oferta atualizada', ...json(apiResponseSchema(offerResponseSchema)) },
      403: { description: 'Sem permissão', ...json(errorResponseSchema) },
      404: { description: 'Não encontrada', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: toOpenApiPath(apiRoutes.offers.remove),
    tags: [tags.offers],
    summary: 'Remover oferta (apenas o dono)',
    security: [{ [bearerAuthName]: [] }],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Oferta removida', ...json(errorResponseSchema) },
      403: { description: 'Sem permissão', ...json(errorResponseSchema) },
      404: { description: 'Não encontrada', ...json(errorResponseSchema) },
    },
  });
}
