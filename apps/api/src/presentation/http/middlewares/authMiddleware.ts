import type { MiddlewareHandler } from 'hono';
import type { ITokenService } from '../../../application/interfaces/identity/ITokenService';
import type { IUserRepository } from '../../../application/interfaces/repositories/IUserRepository';
import type { AppEnv } from '../types';

/**
 * Valida o JWT do header Authorization e injeta `userId` e `claims` no contexto.
 * Bloqueia (401) se o token faltar, for inválido, ou se o `tokenVersion` do token
 * não corresponder ao do utilizador (ex.: após logout, que o incrementa).
 */
export function authMiddleware(
  tokens: ITokenService,
  users: IUserRepository,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const header = c.req.header('Authorization') ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return c.json(
        { succeeded: false, message: 'Autenticação necessária.', data: null, errors: [] },
        401,
      );
    }

    const claims = await tokens.verify(token);
    if (!claims) {
      return c.json(
        { succeeded: false, message: 'Token inválido ou expirado.', data: null, errors: [] },
        401,
      );
    }

    // Revogação: o token só é aceite se a sua versão coincidir com a do utilizador.
    const user = await users.findById(claims.sub);
    if (!user || user.tokenVersion !== claims.tokenVersion) {
      return c.json(
        {
          succeeded: false,
          message: 'Sessão terminada. Inicie sessão novamente.',
          data: null,
          errors: [],
        },
        401,
      );
    }

    c.set('userId', claims.sub);
    c.set('claims', claims);
    await next();
  };
}
