import { IntegrationError } from './IntegrationError';

export interface HttpRequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface HttpIntegrationClientOptions {
  baseUrl: string;
  /** Headers aplicados a todos os pedidos (ex.: auth). */
  defaultHeaders?: Record<string, string>;
  /** Timeout por pedido, em ms. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Base de todos os clientes de integração externa (o equivalente ao "HttpClient
 * tipado" do C#). Centraliza: montagem do URL + query, headers por omissão,
 * serialização JSON, timeout e conversão de falhas em `IntegrationError`.
 *
 * Cada fornecedor estende-a e expõe apenas métodos de negócio, mapeando a resposta
 * crua para os seus próprios modelos. Ver `ExchangeRateClient` como referência viva.
 */
export abstract class HttpIntegrationClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;

  protected constructor(
    /** Nome do fornecedor, usado nas mensagens de erro/log. */
    protected readonly provider: string,
    options: HttpIntegrationClientOptions,
  ) {
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  protected get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  protected post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  protected put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(options?.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...this.defaultHeaders,
      ...options?.headers,
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? AbortSignal.timeout(this.timeoutMs),
      });
    } catch (cause) {
      // Rede indisponível, timeout, DNS, etc.
      throw new IntegrationError(this.provider, `Falha ao contactar ${method} ${path}.`, 0, cause);
    }

    const text = await response.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      throw new IntegrationError(
        this.provider,
        `${method} ${path} respondeu ${response.status}.`,
        response.status,
        payload ?? text,
      );
    }

    return payload as T;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
