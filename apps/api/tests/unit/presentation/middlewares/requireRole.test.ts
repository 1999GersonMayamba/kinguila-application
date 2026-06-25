import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { requireRole } from '../../../../src/presentation/http/middlewares/requireRole';
import type { AppEnv } from '../../../../src/presentation/http/types';

/** App mínima que injeta `claims` com as roles dadas (ou nenhumas) antes do guard. */
function appWithRoles(roles: string[] | null) {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    if (roles) {
      c.set('claims', { sub: 'u1', email: 'u@x.com', roles, tokenVersion: 0 });
    }
    await next();
  });
  app.get('/admin', requireRole('admin'), (c) => c.json({ succeeded: true }));
  return app;
}

describe('requireRole', () => {
  it('deixa passar quando a role exigida está presente', async () => {
    const res = await appWithRoles(['client', 'admin']).request('/admin');
    expect(res.status).toBe(200);
  });

  it('devolve 403 FORBIDDEN_ROLE quando a role falta', async () => {
    const res = await appWithRoles(['client']).request('/admin');
    expect(res.status).toBe(403);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('FORBIDDEN_ROLE');
  });

  it('devolve 403 quando não há claims (defensivo)', async () => {
    const res = await appWithRoles(null).request('/admin');
    expect(res.status).toBe(403);
  });
});
