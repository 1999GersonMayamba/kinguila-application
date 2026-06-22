import { authRoutes } from '@/features/auth/routes';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { offerRoutes } from '@/features/offers/routes';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [...offerRoutes, ...authRoutes],
});

/** Guarda de navegação: rotas com meta.requiresAuth exigem sessão. */
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
