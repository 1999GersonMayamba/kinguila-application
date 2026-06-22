import { apiRoutes } from '@/shared/api/apiRoutes';
import { httpClient } from '@/shared/api/httpClient';
import type {
  AuthResponse,
  AuthUser,
  ConfirmEmailRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordResetRequest,
  ResendCodeRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
} from '@kinguila/contracts';

export const authService = {
  register(payload: RegisterRequest) {
    return httpClient.post<RegisterResponse>(apiRoutes.auth.register, payload);
  },
  login(payload: LoginRequest) {
    return httpClient.post<AuthResponse>(apiRoutes.auth.login, payload);
  },
  me() {
    return httpClient.get<AuthUser>(apiRoutes.auth.me);
  },
  confirmEmail(payload: ConfirmEmailRequest) {
    return httpClient.post<AuthResponse>(apiRoutes.auth.confirmEmail, payload);
  },
  resendCode(payload: ResendCodeRequest) {
    return httpClient.post<null>(apiRoutes.auth.resendCode, payload);
  },
  requestPasswordReset(payload: RequestPasswordResetRequest) {
    return httpClient.post<null>(apiRoutes.auth.requestPasswordReset, payload);
  },
  validateResetToken(payload: ValidateResetTokenRequest) {
    return httpClient.post<null>(apiRoutes.auth.validateResetToken, payload);
  },
  resetPassword(payload: ResetPasswordRequest) {
    return httpClient.post<null>(apiRoutes.auth.resetPassword, payload);
  },
  refresh(payload: RefreshTokenRequest) {
    return httpClient.post<AuthResponse>(apiRoutes.auth.refresh, payload);
  },
  logout() {
    return httpClient.post<null>(apiRoutes.auth.logout);
  },
};
