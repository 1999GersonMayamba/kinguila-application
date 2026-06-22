import { apiRoutes } from '@/shared/api/apiRoutes';
import { httpClient } from '@/shared/api/httpClient';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@kinguila/contracts';

export const authService = {
  register(payload: RegisterRequest) {
    return httpClient.post<AuthResponse>(apiRoutes.auth.register, payload);
  },
  login(payload: LoginRequest) {
    return httpClient.post<AuthResponse>(apiRoutes.auth.login, payload);
  },
  me() {
    return httpClient.get<AuthUser>(apiRoutes.auth.me);
  },
};
