import type { MiddlewareHandler } from 'hono';
import type { ZodSchema } from 'zod';
import type { AppContext, AppEnv } from '../types';

type Target = 'json' | 'query';

/**
 * Middleware de validação com Zod. Valida o body (json) ou a query string e
 * guarda o resultado tipado em `c.set('valid:<target>')`. Em caso de erro
 * devolve 422 com a lista de mensagens.
 */
export function validate(schema: ZodSchema, target: Target = 'json'): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const raw = target === 'json' ? await c.req.json().catch(() => ({})) : c.req.query();
    const result = schema.safeParse(raw);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.') || 'campo'}: ${issue.message}`,
      );
      return c.json({ succeeded: false, message: 'Dados inválidos.', data: null, errors }, 422);
    }

    c.set(`valid:${target}`, result.data);
    await next();
  };
}

/** Obtém os dados validados guardados pelo middleware `validate`. */
export function validated<T>(c: AppContext, target: Target = 'json'): T {
  return c.get(`valid:${target}`) as T;
}
