import type { MiddlewareHandler } from 'hono';
import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import type { AppEnv, AppHono } from '../types';
import { loginSchema, registerSchema } from '../validators/auth.validators';

export function registerAuthRoutes(
  app: AppHono,
  controller: AuthController,
  requireAuth: MiddlewareHandler<AppEnv>,
) {
  app.post(apiRoutes.auth.register, validate(registerSchema), controller.register);
  app.post(apiRoutes.auth.login, validate(loginSchema), controller.login);
  app.get(apiRoutes.auth.me, requireAuth, controller.me);
}
