import type { Context, Hono } from 'hono';
import type { TokenClaims } from '../../application/interfaces/identity/ITokenService';

/** Variáveis injetadas no contexto Hono pelos middlewares. */
export type AppVariables = {
  userId: string;
  claims: TokenClaims;
  // Dados validados guardados pelo middleware `validate`.
  'valid:json': unknown;
  'valid:query': unknown;
};

/** Ambiente Hono da aplicação (usado de forma consistente em toda a presentation). */
export type AppEnv = { Variables: AppVariables };

/** Atalhos para tipar contextos e o app. */
export type AppContext = Context<AppEnv>;
export type AppHono = Hono<AppEnv>;
