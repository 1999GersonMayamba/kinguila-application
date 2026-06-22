import type { ApiResponse } from '@kinguila/contracts';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Response as ServiceResponse } from '../../../application/common/Response';
import type { AppContext } from '../types';

/**
 * Traduz o `Response<T>` dos serviços para uma resposta HTTP Hono, no formato
 * `ApiResponse<T>` que o front-end consome.
 */
export function toHttp<T>(c: AppContext, result: ServiceResponse<T>) {
  const body: ApiResponse<T> = {
    succeeded: result.succeeded,
    message: result.message,
    data: result.data,
    errors: result.errors,
  };
  return c.json(body, result.statusCode as ContentfulStatusCode);
}
