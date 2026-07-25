import type {
  ListUsersQuery,
  SetUserDisabledRequest,
  UpdateUserRequest,
} from '@kinguila/contracts';
import type { IAdminUserService } from '../../../application/interfaces/services/IAdminUserService';
import { toHttp } from '../helpers/toHttp';
import { validated } from '../middlewares/validate';
import type { AppContext } from '../types';

export class AdminUserController {
  constructor(private readonly adminUsers: IAdminUserService) {}

  list = async (c: AppContext) => {
    const query = validated<ListUsersQuery>(c, 'query');
    return toHttp(c, await this.adminUsers.list(query));
  };

  getById = async (c: AppContext) => {
    return toHttp(c, await this.adminUsers.getById(c.req.param('id') ?? ''));
  };

  update = async (c: AppContext) => {
    const body = validated<UpdateUserRequest>(c);
    return toHttp(c, await this.adminUsers.update(c.req.param('id') ?? '', body));
  };

  setDisabled = async (c: AppContext) => {
    const body = validated<SetUserDisabledRequest>(c);
    return toHttp(c, await this.adminUsers.setDisabled(c.req.param('id') ?? '', body.disabled));
  };

  resetPassword = async (c: AppContext) => {
    return toHttp(c, await this.adminUsers.resetPassword(c.req.param('id') ?? ''));
  };
}
