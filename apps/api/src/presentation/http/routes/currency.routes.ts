import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { CurrencyController } from '../controllers/CurrencyController';
import type { AppHono } from '../types';

export function registerCurrencyRoutes(app: AppHono, controller: CurrencyController) {
  app.get(apiRoutes.currencies.list, controller.list);
}
