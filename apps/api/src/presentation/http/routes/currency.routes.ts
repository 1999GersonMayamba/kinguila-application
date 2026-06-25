import type { MiddlewareHandler } from 'hono';
import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { CurrencyController } from '../controllers/CurrencyController';
import { validate } from '../middlewares/validate';
import type { AppEnv, AppHono } from '../types';
import { setCurrencyEnabledSchema, updateCurrencySchema } from '../validators/currency.validators';

export function registerCurrencyRoutes(
  app: AppHono,
  controller: CurrencyController,
  requireAuth: MiddlewareHandler<AppEnv>,
) {
  // Leitura pública das moedas ativas (compatibilidade).
  app.get(apiRoutes.currencies.list, controller.list);
  // `/all` antes de `/:code` para não ser capturado pelo parâmetro.
  app.get(apiRoutes.currencies.listAll, requireAuth, controller.listAll);
  app.get(apiRoutes.currencies.byCode, controller.getByCode);

  // Escrita (gestão): autenticado. TODO(fase de enforcement): requireRole(ROLE_ADMIN).
  app.put(
    apiRoutes.currencies.update,
    requireAuth,
    validate(updateCurrencySchema),
    controller.update,
  );
  app.patch(
    apiRoutes.currencies.setEnabled,
    requireAuth,
    validate(setCurrencyEnabledSchema),
    controller.setEnabled,
  );
}
