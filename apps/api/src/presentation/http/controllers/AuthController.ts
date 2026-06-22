import type {
  ConfirmEmailRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResendCodeRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
} from '@kinguila/contracts';
import type { IAuthService } from '../../../application/interfaces/services/IAuthService';
import type { IEmailVerificationService } from '../../../application/interfaces/services/IEmailVerificationService';
import type { IPasswordResetService } from '../../../application/interfaces/services/IPasswordResetService';
import { toHttp } from '../helpers/toHttp';
import { validated } from '../middlewares/validate';
import type { AppContext } from '../types';

/** Controller fino: extrai input validado, chama o serviço, devolve toHttp. */
export class AuthController {
  constructor(
    private readonly authService: IAuthService,
    private readonly emailVerification: IEmailVerificationService,
    private readonly passwordReset: IPasswordResetService,
  ) {}

  register = async (c: AppContext) => {
    const body = validated<RegisterRequest>(c);
    return toHttp(c, await this.authService.register(body));
  };

  login = async (c: AppContext) => {
    const body = validated<LoginRequest>(c);
    return toHttp(c, await this.authService.login(body));
  };

  me = async (c: AppContext) => {
    return toHttp(c, await this.authService.me(c.get('userId')));
  };

  confirmEmail = async (c: AppContext) => {
    const body = validated<ConfirmEmailRequest>(c);
    return toHttp(c, await this.emailVerification.confirm(body));
  };

  resendCode = async (c: AppContext) => {
    const body = validated<ResendCodeRequest>(c);
    return toHttp(c, await this.emailVerification.resend(body));
  };

  requestPasswordReset = async (c: AppContext) => {
    const body = validated<RequestPasswordResetRequest>(c);
    return toHttp(c, await this.passwordReset.request(body));
  };

  validateResetToken = async (c: AppContext) => {
    const body = validated<ValidateResetTokenRequest>(c);
    return toHttp(c, await this.passwordReset.validateToken(body));
  };

  resetPassword = async (c: AppContext) => {
    const body = validated<ResetPasswordRequest>(c);
    return toHttp(c, await this.passwordReset.reset(body));
  };

  refresh = async (c: AppContext) => {
    const body = validated<RefreshTokenRequest>(c);
    return toHttp(c, await this.authService.refresh(body));
  };

  logout = async (c: AppContext) => {
    return toHttp(c, await this.authService.logout(c.get('userId')));
  };
}
