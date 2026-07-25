import { ApiError } from '@/shared/api/httpClient';
import type { CurrencyResponse, UpdateCurrencyRequest } from '@kinguila/contracts';
import { ref } from 'vue';
import { currencyAdminService } from '../services/currencyAdminService';

/** Estado e ações da gestão de moedas (CRUD real). */
export function useCurrencyAdmin() {
  const items = ref<CurrencyResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  /** Código cuja operação (toggle) está em curso, para desativar o controlo. */
  const busyCode = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await currencyAdminService.listAll();
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar as moedas.';
    } finally {
      loading.value = false;
    }
  }

  async function save(code: string, payload: UpdateCurrencyRequest): Promise<boolean> {
    try {
      const updated = await currencyAdminService.update(code, payload);
      replace(updated);
      return true;
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível guardar.';
      return false;
    }
  }

  async function toggleEnabled(code: string, enabled: boolean) {
    busyCode.value = code;
    error.value = null;
    try {
      const updated = await currencyAdminService.setEnabled(code, enabled);
      replace(updated);
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível alterar o estado.';
    } finally {
      busyCode.value = null;
    }
  }

  function replace(currency: CurrencyResponse) {
    items.value = items.value.map((c) => (c.code === currency.code ? currency : c));
  }

  return { items, loading, error, busyCode, load, save, toggleEnabled };
}
