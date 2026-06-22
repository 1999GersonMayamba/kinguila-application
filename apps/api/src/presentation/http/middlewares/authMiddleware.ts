import type { MiddlewareHandler } from 'hono';
import type { ITokenService } from '../../../application/interfaces/identity/ITokenService';
import type { AppEnv } from '../types';

/**
 * Valida o JWT do header Authorization e injeta `userId` e `claims` no contexto.
 * Bloqueia (401) se o token faltar ou for inválido.
 */
export function authMiddleware(tokens: ITokenService): MiddlewareHandler<AppEnv> {
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

    c.set('userId', claims.sub);
    c.set('claims', claims);
    await next();
  };
}
