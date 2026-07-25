import type { RouteRecordRaw } from 'vue-router';

export const offerRoutes: RouteRecordRaw[] = [
  {
    path: '/offers',
    name: 'offers',
    component: () => import('./views/OffersListView.vue'),
    // Marketplace vive no shell autenticado (sidebar), como no Figma.
    meta: { layout: 'app', requiresAuth: true },
  },
];
