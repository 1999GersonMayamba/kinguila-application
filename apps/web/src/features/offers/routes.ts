import type { RouteRecordRaw } from 'vue-router';

export const offerRoutes: RouteRecordRaw[] = [
  {
    path: '/offers',
    name: 'offers',
    component: () => import('./views/OffersListView.vue'),
  },
];
