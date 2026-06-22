/**
 * Converte uma rota no estilo do Hono/`apiRoutes` (`/offers/:id`) para o formato
 * OpenAPI (`/offers/{id}`). Permite reusar o `apiRoutes` como fonte única.
 */
export function toOpenApiPath(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}
