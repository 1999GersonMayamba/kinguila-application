import { ApiError } from '@/shared/api/httpClient';
import { ref } from 'vue';
import { type RouteLocationRaw, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

interface SubmitOptions {
  /**
   * Destino após sucesso. `undefined` → vai para `offers` (default de login).
   * `null` → não redireciona (a view trata do encaminhamento, ex.: registo).
   */
  redirectTo?: RouteLocationRaw | null;
}

/** Encapsula o estado de submissão (loading/erro) dos formulários de auth. */
export function useAuthForm() {
  const auth = useAuthStore();
  const router = useRouter();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const errorCode = ref<string | null>(null);

  async function submit(action: () => Promise<void>, options: SubmitOptions = {}) {
    loading.value = true;
    error.value = null;
    errorCode.value = null;
    try {
      await action();
      const target = options.redirectTo === undefined ? { name: 'offers' } : options.redirectTo;
      if (target) {
        await router.push(target);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message;
        errorCode.value = err.code ?? null;
      } else {
        error.value = 'Ocorreu um erro inesperado.';
      }
    } finally {
      loading.value = false;
    }
  }

  return { auth, loading, error, errorCode, submit };
}
