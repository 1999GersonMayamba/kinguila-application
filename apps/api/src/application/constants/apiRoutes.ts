/**
 * Todas as rotas HTTP centralizadas. Nunca usar strings de rota soltas nos controllers.
 * Base versionada: /api/v1.
 */
const BASE = '/api/v1';

export const apiRoutes = {
  base: BASE,
  health: '/health',
  docs: {
    ui: '/docs',
    json: '/openapi.json',
  },
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
  currencies: {
    list: `${BASE}/currencies`,
    listAll: `${BASE}/currencies/all`,
    byCode: `${BASE}/currencies/:code`,
    update: `${BASE}/currencies/:code`,
    setEnabled: `${BASE}/currencies/:code/enabled`,
  },
  offers: {
    list: `${BASE}/offers`,
    getById: `${BASE}/offers/:id`,
    create: `${BASE}/offers`,
    update: `${BASE}/offers/:id`,
    remove: `${BASE}/offers/:id`,
  },
  adminUsers: {
    list: `${BASE}/admin/users`,
    getById: `${BASE}/admin/users/:id`,
    update: `${BASE}/admin/users/:id`,
    setDisabled: `${BASE}/admin/users/:id/disabled`,
    resetPassword: `${BASE}/admin/users/:id/reset-password`,
  },
} as const;
