import type { ApiResponse, AuthResponse } from '@kinguila/contracts';
import { apiRoutes } from './apiRoutes';

/**
 * Cliente HTTP tipado sobre fetch. Injeta o access token, desembrulha o envelope
 * `ApiResponse<T>` e, em caso de 401, tenta renovar a sessão uma vez com o refresh
 * token antes de falhar. Os serviços de feature usam-no — os componentes nunca
 * chamam fetch diretamente.
 */

const ACCESS_TOKEN_STORAGE_KEY = 'kinguila.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'kinguila.refreshToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function clearTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}

/** Erro com a mensagem amigável vinda da API. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: string[] = [],
    /** Código de erro legível por máquina (ex.: ACCOUNT_NOT_CONFIRMED). */
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

/** Tenta trocar o refresh token por um novo par. Devolve true se renovou. */
async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const response = await fetch(
      new URL(apiRoutes.auth.refresh, window.location.origin).toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
    );
    const payload = (await response.json().catch(() => null)) as ApiResponse<AuthResponse> | null;
    if (!response.ok || !payload?.succeeded || !payload.data) {
      clearTokens();
      return false;
    }
    setAccessToken(payload.data.tokens.accessToken);
    setRefreshToken(payload.data.tokens.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Um 401 numa rota não-refresh, com refresh token disponível, pode ser repetido. */
function canRetryWithRefresh(status: number, isRetry: boolean, path: string): boolean {
  return (
    status === 401 && !isRetry && path !== apiRoutes.auth.refresh && getRefreshToken() !== null
  );
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (response.ok && payload?.succeeded) {
    return payload.data as T;
  }

  // 401 numa rota autenticada: tentar renovar uma vez e repetir.
  if (canRetryWithRefresh(response.status, isRetry, path) && (await refreshSession())) {
    return request<T>(method, path, options, true);
  }

  throw new ApiError(
    payload?.message ?? 'Erro inesperado.',
    response.status,
    payload?.errors ?? [],
    payload?.code,
  );
}

export const httpClient = {
  get: <T>(path: string, query?: RequestOptions['query']) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
