import { DomainError } from '../../../domain/errors/DomainError';
import type { AppContext } from '../types';

/**
 * Tratador global de erros não previstos. Erros de domínio que escapem viram 400;
 * o resto vira 500 com mensagem genérica (sem vazar detalhes internos).
 */
export function errorHandler(err: Error, c: AppContext) {
  if (err instanceof DomainError) {
    return c.json({ succeeded: false, message: err.message, data: null, errors: [] }, 400);
  }

  console.error('[erro não tratado]', err);
  return c.json(
    { succeeded: false, message: 'Erro interno do servidor.', data: null, errors: [] },
    500,
  );
}
