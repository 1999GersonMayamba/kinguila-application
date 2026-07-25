import type { MiddlewareHandler } from 'hono';
import { apiRoutes } from '../../../application/constants/apiRoutes';
import type { AdminUserController } from '../controllers/AdminUserController';
import { validate } from '../middlewares/validate';
import type { AppEnv, AppHono } from '../types';
import {
  listUsersQuerySchema,
  setUserDisabledSchema,
  updateUserSchema,
} from '../validators/adminUser.validators';

/**
 * Rotas de administração de utilizadores. Nesta fase exigem apenas `requireAuth`.
 * TODO(fase de enforcement): anexar `requireRole(ROLE_ADMIN)` a seguir ao `requireAuth`
 * (o middleware já existe em `middlewares/requireRole.ts`).
 */
export function registerAdminUserRoutes(
  app: AppHono,
  controller: AdminUserController,
  requireAuth: MiddlewareHandler<AppEnv>,
) {
  app.get(
    apiRoutes.adminUsers.list,
    requireAuth,
    validate(listUsersQuerySchema, 'query'),
    controller.list,
  );
  app.get(apiRoutes.adminUsers.getById, requireAuth, controller.getById);
  app.put(apiRoutes.adminUsers.update, requireAuth, validate(updateUserSchema), controller.update);
  app.patch(
    apiRoutes.adminUsers.setDisabled,
    requireAuth,
    validate(setUserDisabledSchema),
    controller.setDisabled,
  );
  app.post(apiRoutes.adminUsers.resetPassword, requireAuth, controller.resetPassword);
}
