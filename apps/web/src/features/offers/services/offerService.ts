import { apiRoutes } from '@/shared/api/apiRoutes';
import { httpClient } from '@/shared/api/httpClient';
import type {
  CreateOfferRequest,
  ListOffersQuery,
  OfferResponse,
  PagedResult,
} from '@kinguila/contracts';

export const offerService = {
  list(query: ListOffersQuery = {}) {
    return httpClient.get<PagedResult<OfferResponse>>(apiRoutes.offers.list, {
      sellCurrency: query.sellCurrency,
      buyCurrency: query.buyCurrency,
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  getById(id: string) {
    return httpClient.get<OfferResponse>(apiRoutes.offers.byId(id));
  },
  create(payload: CreateOfferRequest) {
    return httpClient.post<OfferResponse>(apiRoutes.offers.create, payload);
  },
};
