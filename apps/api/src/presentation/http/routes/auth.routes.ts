import type { MiddlewareHandler } from 'hono';
import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import type { AppEnv, AppHono } from '../types';
import {
  confirmEmailSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  requestPasswordResetSchema,
  resendCodeSchema,
  resetPasswordSchema,
  validateResetTokenSchema,
} from '../validators/auth.validators';

export function registerAuthRoutes(
  app: AppHono,
  controller: AuthController,
  requireAuth: MiddlewareHandler<AppEnv>,
) {
  app.post(apiRoutes.auth.register, validate(registerSchema), controller.register);
  app.post(apiRoutes.auth.login, validate(loginSchema), controller.login);
  app.get(apiRoutes.auth.me, requireAuth, controller.me);

  // Rotas públicas de verificação de conta e reset de senha (sem requireAuth).
  app.post(apiRoutes.auth.confirmEmail, validate(confirmEmailSchema), controller.confirmEmail);
  app.post(apiRoutes.auth.resendCode, validate(resendCodeSchema), controller.resendCode);
  app.post(
    apiRoutes.auth.requestPasswordReset,
    validate(requestPasswordResetSchema),
    controller.requestPasswordReset,
  );
  app.post(
    apiRoutes.auth.validateResetToken,
    validate(validateResetTokenSchema),
    controller.validateResetToken,
  );
  app.post(apiRoutes.auth.resetPassword, validate(resetPasswordSchema), controller.resetPassword);

  // Refresh é público (o access token pode já ter expirado); logout exige sessão válida.
  app.post(apiRoutes.auth.refresh, validate(refreshTokenSchema), controller.refresh);
  app.post(apiRoutes.auth.logout, requireAuth, controller.logout);
}
