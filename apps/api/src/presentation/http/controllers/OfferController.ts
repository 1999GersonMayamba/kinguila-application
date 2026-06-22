import type { CreateOfferRequest, ListOffersQuery, UpdateOfferRequest } from '@kinguila/contracts';
import type { IOfferService } from '../../../application/interfaces/services/IOfferService';
import { toHttp } from '../helpers/toHttp';
import { validated } from '../middlewares/validate';
import type { AppContext } from '../types';

export class OfferController {
  constructor(private readonly offerService: IOfferService) {}

  list = async (c: AppContext) => {
    const query = validated<ListOffersQuery>(c, 'query');
    return toHttp(c, await this.offerService.list(query));
  };

  getById = async (c: AppContext) => {
    return toHttp(c, await this.offerService.getById(c.req.param('id') ?? ''));
  };

  create = async (c: AppContext) => {
    const body = validated<CreateOfferRequest>(c);
    return toHttp(c, await this.offerService.create(body, c.get('userId')));
  };

  update = async (c: AppContext) => {
    const body = validated<UpdateOfferRequest>(c);
    return toHttp(
      c,
      await this.offerService.update(c.req.param('id') ?? '', body, c.get('userId')),
    );
  };

  remove = async (c: AppContext) => {
    return toHttp(c, await this.offerService.remove(c.req.param('id') ?? '', c.get('userId')));
  };
}
