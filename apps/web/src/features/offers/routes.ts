import type { RouteRecordRaw } from 'vue-router';

export const offerRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'offers',
    component: () => import('./views/OffersListView.vue'),
  },
];
