import type { RouteRecordRaw } from 'vue-router';

/**
 * Rotas pós-login (layout `app`, exigem sessão). TODO(enforcement): adicionar
 * `meta.requiresRole = 'admin'` e um guard de role quando o bloqueio for ativado;
 * nesta fase estão visíveis a qualquer sessão autenticada (KTD10).
 */
export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/home',
    name: 'home',
    component: () => import('./views/HomeView.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./views/SettingsView.vue'),
    meta: { layout: 'app', requiresAuth: true },
  },
];
