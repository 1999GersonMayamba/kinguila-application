import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';

/**
 * Exige que o utilizador autenticado tenha a role indicada. Deve correr DEPOIS do
 * `authMiddleware` (que injeta `claims` no contexto). Devolve 403 se faltar.
 *
 * NOTA (fase de estrutura): este middleware está pronto mas ainda **NÃO é aplicado**
 * a nenhuma rota — o bloqueio por role entra numa fase seguinte. Para ativar, importar
 * e anexar `requireRole(ROLE_ADMIN)` nas rotas de gestão (moedas/admin de utilizadores),
 * logo a seguir ao `requireAuth`.
 */
export function requireRole(role: string): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const claims = c.get('claims');
    if (!claims || !claims.roles.includes(role)) {
      return c.json(
        {
          succeeded: false,
          message: 'Acesso restrito.',
          data: null,
          errors: [],
          code: 'FORBIDDEN_ROLE',
        },
        403,
      );
    }
    await next();
  };
}
