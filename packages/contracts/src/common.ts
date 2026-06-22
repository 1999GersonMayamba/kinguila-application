/**
 * Envelope padrão de todas as respostas da API.
 * Espelha o `Response<T>` do back-end (application/common/Response.ts).
 */
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

/** Resultado paginado genérico. */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Parâmetros de paginação aceites pela API. */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}
