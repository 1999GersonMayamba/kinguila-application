import { apiRoutes } from '@/shared/api/apiRoutes';
import { httpClient } from '@/shared/api/httpClient';
import type { CurrencyResponse, UpdateCurrencyRequest } from '@kinguila/contracts';

export const currencyAdminService = {
  listAll() {
    return httpClient.get<CurrencyResponse[]>(apiRoutes.currencies.listAll);
  },
  update(code: string, payload: UpdateCurrencyRequest) {
    return httpClient.put<CurrencyResponse>(apiRoutes.currencies.update(code), payload);
  },
  setEnabled(code: string, enabled: boolean) {
    return httpClient.patch<CurrencyResponse>(apiRoutes.currencies.setEnabled(code), { enabled });
  },
};
