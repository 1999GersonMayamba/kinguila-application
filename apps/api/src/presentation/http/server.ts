import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiRoutes } from '../../application/constants/apiRoutes';
import type { Container } from '../../composition/container';
import { env } from '../../config/env';
import { errorHandler } from './middlewares/errorHandler';
import { buildOpenApiDocument } from './openapi/document';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerCurrencyRoutes } from './routes/currency.routes';
import { registerOfferRoutes } from './routes/offer.routes';
import type { AppEnv } from './types';

/** Cria o app Hono, aplica middlewares globais e regista todas as rotas. */
export function createServer(container: Container) {
  const app = new Hono<AppEnv>();

  app.use('*', logger());
  app.use('*', cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.onError(errorHandler);

  app.get(apiRoutes.health, (c) =>
    c.json({ succeeded: true, message: 'ok', data: { status: 'up' }, errors: [] }),
  );

  // Documentação da API: JSON OpenAPI + Swagger UI. Gerado uma vez no arranque.
  const openApiDocument = buildOpenApiDocument();
  app.get(apiRoutes.docs.json, (c) => c.json(openApiDocument));
  app.get(apiRoutes.docs.ui, swaggerUI({ url: apiRoutes.docs.json }));

  const { controllers, middlewares } = container;
  registerAuthRoutes(app, controllers.authController, middlewares.requireAuth);
  registerCurrencyRoutes(app, controllers.currencyController);
  registerOfferRoutes(app, controllers.offerController, middlewares.requireAuth);

  app.notFound((c) =>
    c.json({ succeeded: false, message: 'Rota não encontrada.', data: null, errors: [] }, 404),
  );

  return app;
}
