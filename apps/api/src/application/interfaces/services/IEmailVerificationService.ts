import type { AuthResponse, ConfirmEmailRequest, ResendCodeRequest } from '@kinguila/contracts';
import type { Response } from '../../common/Response';

export interface IEmailVerificationService {
  /** Gera e envia um código de confirmação para o utilizador (disparado no registo). */
  sendCode(userId: string, email: string): Promise<void>;
  /** Valida o código; ao confirmar a conta, emite os tokens JWT. */
  confirm(request: ConfirmEmailRequest): Promise<Response<AuthResponse>>;
  /** Reenvia o código (rate-limited; resposta genérica anti-enumeração). */
  resend(request: ResendCodeRequest): Promise<Response<null>>;
}
