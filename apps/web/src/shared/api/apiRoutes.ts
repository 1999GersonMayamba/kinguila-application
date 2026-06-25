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
  currencies: {
    list: `${BASE}/currencies`,
    listAll: `${BASE}/currencies/all`,
    byCode: (code: string) => `${BASE}/currencies/${code}`,
    update: (code: string) => `${BASE}/currencies/${code}`,
    setEnabled: (code: string) => `${BASE}/currencies/${code}/enabled`,
  },
  adminUsers: {
    list: `${BASE}/admin/users`,
    byId: (id: string) => `${BASE}/admin/users/${id}`,
    update: (id: string) => `${BASE}/admin/users/${id}`,
    setDisabled: (id: string) => `${BASE}/admin/users/${id}/disabled`,
    resetPassword: (id: string) => `${BASE}/admin/users/${id}/reset-password`,
  },
  offers: {
    list: `${BASE}/offers`,
    byId: (id: string) => `${BASE}/offers/${id}`,
    create: `${BASE}/offers`,
  },
} as const;
