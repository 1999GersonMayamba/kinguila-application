import { apiRoutes } from '../../../../application/constants/apiRoutes';
import { loginSchema, registerSchema } from '../../validators/auth.validators';
import type { RegistryContext } from '../registry';
import {
  apiResponseSchema,
  authResponseSchema,
  authUserSchema,
  errorResponseSchema,
  tags,
} from '../schemas';
import type { z } from '../zod';

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

/** Documenta as rotas de autenticação. Acrescenta aqui ao criar uma rota de auth. */
export function registerAuthDocs({ registry, bearerAuthName }: RegistryContext): void {
  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.register,
    tags: [tags.auth],
    summary: 'Registar um novo utilizador',
    request: { body: json(registerSchema) },
    responses: {
      201: { description: 'Conta criada', ...json(apiResponseSchema(authResponseSchema)) },
      409: { description: 'Email já registado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.login,
    tags: [tags.auth],
    summary: 'Autenticar e obter tokens JWT',
    request: { body: json(loginSchema) },
    responses: {
      200: { description: 'Autenticado', ...json(apiResponseSchema(authResponseSchema)) },
      401: { description: 'Credenciais inválidas', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'get',
    path: apiRoutes.auth.me,
    tags: [tags.auth],
    summary: 'Dados do utilizador autenticado',
    security: [{ [bearerAuthName]: [] }],
    responses: {
      200: { description: 'Utilizador', ...json(apiResponseSchema(authUserSchema)) },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
    },
  });
}
