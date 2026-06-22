import type {
  CreateOfferRequest,
  ListOffersQuery,
  OfferResponse,
  UpdateOfferRequest,
} from '@kinguila/contracts';
import type { PagedResult } from '../../common/PagedResult';
import type { Response } from '../../common/Response';

export interface IOfferService {
  list(query: ListOffersQuery): Promise<Response<PagedResult<OfferResponse>>>;
  getById(id: string): Promise<Response<OfferResponse>>;
  create(request: CreateOfferRequest, sellerId: string): Promise<Response<OfferResponse>>;
  update(id: string, request: UpdateOfferRequest, userId: string): Promise<Response<OfferResponse>>;
  remove(id: string, userId: string): Promise<Response<null>>;
}
