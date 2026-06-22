/**
 * Erro de uma integração externa. Distingue-se de `DomainError`: representa uma
 * falha técnica/contratual com um fornecedor (rede, 4xx/5xx, resposta inesperada).
 * Os serviços da Application apanham-no e decidem o `Response.fail` apropriado.
 */
export class IntegrationError extends Error {
  constructor(
    /** Nome do fornecedor (ex.: 'exchange-rate'). */
    readonly provider: string,
    message: string,
    /** Status HTTP devolvido pelo fornecedor (0 se a chamada nem chegou a responder). */
    readonly status = 0,
    /** Corpo/erro original, para diagnóstico (não expor diretamente ao utilizador). */
    readonly details?: unknown,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'IntegrationError';
  }
}
