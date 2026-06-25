import type { AdminUserResponse, ListUsersQuery, UpdateUserRequest } from '@kinguila/contracts';
import type { PagedResult } from '../../common/PagedResult';
import type { Response } from '../../common/Response';

export interface IAdminUserService {
  list(query: ListUsersQuery): Promise<Response<PagedResult<AdminUserResponse>>>;
  getById(id: string): Promise<Response<AdminUserResponse>>;
  /** Edita apenas o nome nesta fase (NÃO roles nem password). */
  update(id: string, request: UpdateUserRequest): Promise<Response<AdminUserResponse>>;
  /** Desativa/reativa a conta; ao desativar, termina as sessões ativas. */
  setDisabled(id: string, disabled: boolean): Promise<Response<AdminUserResponse>>;
  /** Dispara o envio de email de redefinição de senha (não devolve senha). */
  resetPassword(id: string): Promise<Response<null>>;
}
