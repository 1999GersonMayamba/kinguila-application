/**
 * Todas as rotas HTTP centralizadas. Nunca usar strings de rota soltas nos controllers.
 * Base versionada: /api/v1.
 */
const BASE = '/api/v1';

export const apiRoutes = {
  base: BASE,
  health: '/health',
  auth: {
    register: `${BASE}/auth/register`,
    login: `${BASE}/auth/login`,
    me: `${BASE}/auth/me`,
  },
  currencies: {
    list: `${BASE}/currencies`,
  },
  offers: {
    list: `${BASE}/offers`,
    getById: `${BASE}/offers/:id`,
    create: `${BASE}/offers`,
    update: `${BASE}/offers/:id`,
    remove: `${BASE}/offers/:id`,
  },
} as const;
