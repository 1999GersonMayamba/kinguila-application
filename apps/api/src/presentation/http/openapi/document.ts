import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registerAuthDocs } from './paths/auth.docs';
import { registerCurrencyDocs } from './paths/currency.docs';
import { registerOfferDocs } from './paths/offer.docs';
import { createRegistry } from './registry';

/**
 * Monta o documento OpenAPI 3.0 a partir dos registos de cada feature.
 * Ao criar uma feature/rota nova, cria o seu `*.docs.ts` e regista-o aqui.
 */
export function buildOpenApiDocument() {
  const context = createRegistry();

  registerAuthDocs(context);
  registerCurrencyDocs(context);
  registerOfferDocs(context);

  const generator = new OpenApiGeneratorV3(context.registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Kinguila API',
      version: '1.0.0',
      description: 'API da plataforma P2P de compra e venda de divisas.',
    },
    servers: [{ url: '/' }],
  });
}
