import type { MiddlewareHandler } from 'hono';
import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { WalletController } from '../controllers/WalletController';
import { validate } from '../middlewares/validate';
import type { AppEnv, AppHono } from '../types';
import { setListedAmountSchema } from '../validators/wallet.validators';

export function registerWalletRoutes(
  app: AppHono,
  controller: WalletController,
  requireAuth: MiddlewareHandler<AppEnv>,
) {
  app.get(apiRoutes.wallet.me, requireAuth, controller.getMine);
  app.patch(
    apiRoutes.wallet.setListedAmount,
    requireAuth,
    validate(setListedAmountSchema),
    controller.setListedAmount,
  );
}
