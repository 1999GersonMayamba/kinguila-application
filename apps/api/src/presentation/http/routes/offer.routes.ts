import type { MiddlewareHandler } from 'hono';
import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { OfferController } from '../controllers/OfferController';
import { validate } from '../middlewares/validate';
import type { AppEnv, AppHono } from '../types';
import {
  createOfferSchema,
  listOffersQuerySchema,
  updateOfferSchema,
} from '../validators/offer.validators';

export function registerOfferRoutes(
  app: AppHono,
  controller: OfferController,
  requireAuth: MiddlewareHandler<AppEnv>,
) {
  // Leitura pública: compradores pesquisam ofertas sem sessão.
  app.get(apiRoutes.offers.list, validate(listOffersQuerySchema, 'query'), controller.list);
  app.get(apiRoutes.offers.getById, controller.getById);

  // Escrita: apenas autenticado (o vendedor).
  app.post(apiRoutes.offers.create, requireAuth, validate(createOfferSchema), controller.create);
  app.put(apiRoutes.offers.update, requireAuth, validate(updateOfferSchema), controller.update);
  app.delete(apiRoutes.offers.remove, requireAuth, controller.remove);
}
