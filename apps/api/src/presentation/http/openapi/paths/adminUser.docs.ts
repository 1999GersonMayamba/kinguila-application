import { apiRoutes } from '../../../../application/constants/apiRoutes';
import {
  listUsersQuerySchema,
  setUserDisabledSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../../validators/adminUser.validators';
import type { RegistryContext } from '../registry';
import {
  adminUserResponseSchema,
  apiResponseSchema,
  errorResponseSchema,
  pagedAdminUserResponseSchema,
  tags,
} from '../schemas';
import { toOpenApiPath } from '../util';
import type { z } from '../zod';

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

/** Documenta as rotas de administração de utilizadores. */
export function registerAdminUserDocs({ registry, bearerAuthName }: RegistryContext): void {
  const security = [{ [bearerAuthName]: [] }];

  registry.registerPath({
    method: 'get',
    path: apiRoutes.adminUsers.list,
    tags: [tags.adminUsers],
    summary: 'Listar utilizadores (paginado, com filtros)',
    security,
    request: { query: listUsersQuerySchema },
    responses: {
      200: {
        description: 'Utilizadores',
        ...json(apiResponseSchema(pagedAdminUserResponseSchema)),
      },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'get',
    path: toOpenApiPath(apiRoutes.adminUsers.getById),
    tags: [tags.adminUsers],
    summary: 'Detalhe de um utilizador',
    security,
    request: { params: userIdParamSchema },
    responses: {
      200: { description: 'Utilizador', ...json(apiResponseSchema(adminUserResponseSchema)) },
      404: { description: 'Não encontrado', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'put',
    path: toOpenApiPath(apiRoutes.adminUsers.update),
    tags: [tags.adminUsers],
    summary: 'Editar um utilizador (apenas o nome nesta fase)',
    security,
    request: { params: userIdParamSchema, body: json(updateUserSchema) },
    responses: {
      200: { description: 'Atualizado', ...json(apiResponseSchema(adminUserResponseSchema)) },
      404: { description: 'Não encontrado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: toOpenApiPath(apiRoutes.adminUsers.setDisabled),
    tags: [tags.adminUsers],
    summary: 'Desativar/reativar uma conta (desativar termina as sessões)',
    security,
    request: { params: userIdParamSchema, body: json(setUserDisabledSchema) },
    responses: {
      200: {
        description: 'Estado atualizado',
        ...json(apiResponseSchema(adminUserResponseSchema)),
      },
      404: { description: 'Não encontrado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: toOpenApiPath(apiRoutes.adminUsers.resetPassword),
    tags: [tags.adminUsers],
    summary: 'Disparar email de redefinição de senha (não devolve senha)',
    security,
    request: { params: userIdParamSchema },
    responses: {
      200: { description: 'Email enviado', ...json(errorResponseSchema) },
      404: { description: 'Não encontrado', ...json(errorResponseSchema) },
    },
  });
}
