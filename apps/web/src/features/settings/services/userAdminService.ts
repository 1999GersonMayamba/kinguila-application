import { apiRoutes } from '@/shared/api/apiRoutes';
import { httpClient } from '@/shared/api/httpClient';
import type {
  AdminUserResponse,
  ListUsersQuery,
  PagedResult,
  UpdateUserRequest,
} from '@kinguila/contracts';

export const userAdminService = {
  list(query: ListUsersQuery = {}) {
    return httpClient.get<PagedResult<AdminUserResponse>>(apiRoutes.adminUsers.list, {
      name: query.name,
      email: query.email,
      role: query.role,
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  update(id: string, payload: UpdateUserRequest) {
    return httpClient.put<AdminUserResponse>(apiRoutes.adminUsers.update(id), payload);
  },
  setDisabled(id: string, disabled: boolean) {
    return httpClient.patch<AdminUserResponse>(apiRoutes.adminUsers.setDisabled(id), { disabled });
  },
  resetPassword(id: string) {
    return httpClient.post<null>(apiRoutes.adminUsers.resetPassword(id));
  },
};
