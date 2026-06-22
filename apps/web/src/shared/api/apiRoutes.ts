/** Caminhos da API (espelha o back-end). Base servida via proxy do Vite em /api. */
const BASE = '/api/v1';

export const apiRoutes = {
  auth: {
    register: `${BASE}/auth/register`,
    login: `${BASE}/auth/login`,
    me: `${BASE}/auth/me`,
  },
  currencies: `${BASE}/currencies`,
  offers: {
    list: `${BASE}/offers`,
    byId: (id: string) => `${BASE}/offers/${id}`,
    create: `${BASE}/offers`,
  },
} as const;
