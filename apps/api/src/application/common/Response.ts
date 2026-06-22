/**
 * Envelope padrão devolvido por todos os serviços. Os controllers convertem-no em
 * resposta HTTP a partir de `succeeded` e do `statusCode` sugerido.
 */
export class Response<T> {
  private constructor(
    readonly succeeded: boolean,
    readonly message: string,
    readonly data: T | null,
    readonly errors: string[],
    /** Status HTTP sugerido. O controller pode respeitá-lo ou sobrepô-lo. */
    readonly statusCode: number,
    /** Código de erro legível por máquina (ex.: ACCOUNT_NOT_CONFIRMED). */
    readonly code?: string,
  ) {}

  static ok<T>(data: T, message = 'Operação concluída com sucesso', statusCode = 200): Response<T> {
    return new Response<T>(true, message, data, [], statusCode);
  }

  static created<T>(data: T, message = 'Recurso criado com sucesso'): Response<T> {
    return new Response<T>(true, message, data, [], 201);
  }

  static fail<T>(
    message: string,
    errors: string[] = [],
    statusCode = 400,
    code?: string,
  ): Response<T> {
    return new Response<T>(false, message, null, errors, statusCode, code);
  }

  static notFound<T>(message = 'Recurso não encontrado'): Response<T> {
    return new Response<T>(false, message, null, [], 404);
  }

  static forbidden<T>(message = 'Operação não autorizada', code?: string): Response<T> {
    return new Response<T>(false, message, null, [], 403, code);
  }
}
