import type {
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
} from '@kinguila/contracts';
import type { Response } from '../../common/Response';

export interface IPasswordResetService {
  /** Pede o reset: gera token e envia o link (resposta genérica anti-enumeração). */
  request(request: RequestPasswordResetRequest): Promise<Response<null>>;
  /** Valida se o token do link ainda é válido (antes de mostrar o formulário). */
  validateToken(request: ValidateResetTokenRequest): Promise<Response<null>>;
  /** Define a nova senha consumindo o token (uso único). */
  reset(request: ResetPasswordRequest): Promise<Response<null>>;
}
