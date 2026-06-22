import { ApiError } from '@/shared/api/httpClient';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

/** Encapsula o estado de submissão (loading/erro) dos formulários de auth. */
export function useAuthForm() {
  const auth = useAuthStore();
  const router = useRouter();
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function submit(action: () => Promise<void>) {
    loading.value = true;
    error.value = null;
    try {
      await action();
      await router.push({ name: 'offers' });
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado.';
    } finally {
      loading.value = false;
    }
  }

  return { auth, loading, error, submit };
}
