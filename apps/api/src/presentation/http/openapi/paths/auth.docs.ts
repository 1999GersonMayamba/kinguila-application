import { apiRoutes } from '../../../../application/constants/apiRoutes';
import {
  confirmEmailSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  requestPasswordResetSchema,
  resendCodeSchema,
  resetPasswordSchema,
  validateResetTokenSchema,
} from '../../validators/auth.validators';
import type { RegistryContext } from '../registry';
import {
  apiResponseSchema,
  authResponseSchema,
  authUserSchema,
  errorResponseSchema,
  registerResponseSchema,
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
    summary: 'Registar um novo utilizador (conta fica por confirmar)',
    request: { body: json(registerSchema) },
    responses: {
      201: {
        description: 'Conta criada, pendente de confirmação',
        ...json(apiResponseSchema(registerResponseSchema)),
      },
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
      403: {
        description: 'Conta não confirmada (code: ACCOUNT_NOT_CONFIRMED)',
        ...json(errorResponseSchema),
      },
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

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.confirmEmail,
    tags: [tags.auth],
    summary: 'Confirmar a conta com o código de email (emite tokens)',
    request: { body: json(confirmEmailSchema) },
    responses: {
      200: { description: 'Conta confirmada', ...json(apiResponseSchema(authResponseSchema)) },
      403: { description: 'Código inválido/expirado ou bloqueado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.resendCode,
    tags: [tags.auth],
    summary: 'Reenviar o código de confirmação (resposta genérica)',
    request: { body: json(resendCodeSchema) },
    responses: {
      200: { description: 'Pedido aceite', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.requestPasswordReset,
    tags: [tags.auth],
    summary: 'Pedir reset de senha (envia link; resposta genérica)',
    request: { body: json(requestPasswordResetSchema) },
    responses: {
      200: { description: 'Pedido aceite', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.validateResetToken,
    tags: [tags.auth],
    summary: 'Validar se o link de reset ainda é válido',
    request: { body: json(validateResetTokenSchema) },
    responses: {
      200: { description: 'Link válido', ...json(errorResponseSchema) },
      403: { description: 'Link inválido/expirado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.resetPassword,
    tags: [tags.auth],
    summary: 'Definir a nova senha através do token de reset',
    request: { body: json(resetPasswordSchema) },
    responses: {
      200: { description: 'Senha redefinida', ...json(errorResponseSchema) },
      403: { description: 'Link inválido/expirado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.refresh,
    tags: [tags.auth],
    summary: 'Renovar a sessão com o refresh token (novo par de tokens)',
    request: { body: json(refreshTokenSchema) },
    responses: {
      200: { description: 'Sessão renovada', ...json(apiResponseSchema(authResponseSchema)) },
      401: { description: 'Refresh token inválido/revogado', ...json(errorResponseSchema) },
      422: { description: 'Dados inválidos', ...json(errorResponseSchema) },
    },
  });

  registry.registerPath({
    method: 'post',
    path: apiRoutes.auth.logout,
    tags: [tags.auth],
    summary: 'Terminar a sessão (invalida todos os tokens do utilizador)',
    security: [{ [bearerAuthName]: [] }],
    responses: {
      200: { description: 'Sessão terminada', ...json(errorResponseSchema) },
      401: { description: 'Não autenticado', ...json(errorResponseSchema) },
    },
  });
}
