/**
 * Erro previsível de regra de negócio. Distingue-se de erros técnicos: é seguro
 * apresentar a mensagem ao utilizador. Os serviços convertem-no em `Response.fail`.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string = 'DOMAIN_ERROR',
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

/** Recurso não encontrado. */
export class NotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/** Operação não autorizada para o utilizador atual. */
export class ForbiddenError extends DomainError {
  constructor(message = 'Operação não autorizada') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}
