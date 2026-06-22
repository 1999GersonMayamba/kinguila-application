import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export interface RegistryContext {
  registry: OpenAPIRegistry;
  /** Nome do esquema de segurança Bearer (JWT), para referenciar nas rotas protegidas. */
  bearerAuthName: string;
}

/**
 * Cria o registo OpenAPI e regista o esquema de autenticação Bearer (JWT).
 * Cada feature regista as suas rotas neste registo (ver openapi/paths/*).
 */
export function createRegistry(): RegistryContext {
  const registry = new OpenAPIRegistry();

  const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  return { registry, bearerAuthName: bearerAuth.name };
}
