import { useAuthStore } from '@/features/auth/stores/auth.store';
import { computed } from 'vue';

/**
 * Verificação de roles no front-end. Nesta fase é usado apenas para leitura
 * (ex.: mostrar um distintivo); o **esconder** por role e o bloqueio entram na
 * fase de enforcement (ver plano KTD10) — por agora o menu é visível a todos.
 */
export function useRole() {
  const auth = useAuthStore();
  const isAdmin = computed(() => auth.user?.roles.includes('admin') ?? false);
  function hasRole(role: string): boolean {
    return auth.user?.roles.includes(role) ?? false;
  }
  return { isAdmin, hasRole };
}
