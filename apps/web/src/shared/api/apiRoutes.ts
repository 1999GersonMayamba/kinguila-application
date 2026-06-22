/** Caminhos da API (espelha o back-end). Base servida via proxy do Vite em /api. */
const BASE = '/api/v1';

export const apiRoutes = {
  auth: {
    register: `${BASE}/auth/register`,
    login: `${BASE}/auth/login`,
    me: `${BASE}/auth/me`,
    confirmEmail: `${BASE}/auth/confirm-email`,
    resendCode: `${BASE}/auth/resend-code`,
    requestPasswordReset: `${BASE}/auth/request-password-reset`,
    validateResetToken: `${BASE}/auth/validate-reset-token`,
    resetPassword: `${BASE}/auth/reset-password`,
    refresh: `${BASE}/auth/refresh`,
    logout: `${BASE}/auth/logout`,
  },
  currencies: `${BASE}/currencies`,
  offers: {
    list: `${BASE}/offers`,
    byId: (id: string) => `${BASE}/offers/${id}`,
    create: `${BASE}/offers`,
  },
} as const;
