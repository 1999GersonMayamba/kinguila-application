import { ApiError } from '@/shared/api/httpClient';
import type { ListOffersQuery, OfferResponse } from '@kinguila/contracts';
import { ref } from 'vue';
import { offerService } from '../services/offerService';

/** Carrega e expõe a lista de ofertas com estado de loading/erro. */
export function useOffers() {
  const offers = ref<OfferResponse[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load(query: ListOffersQuery = {}) {
    loading.value = true;
    error.value = null;
    try {
      const result = await offerService.list(query);
      offers.value = result.items;
      total.value = result.total;
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar as ofertas.';
    } finally {
      loading.value = false;
    }
  }

  return { offers, total, loading, error, load };
}
