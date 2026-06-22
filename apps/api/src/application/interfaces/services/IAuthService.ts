import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@kinguila/contracts';
import type { Response } from '../../common/Response';

export interface IAuthService {
  register(request: RegisterRequest): Promise<Response<AuthResponse>>;
  login(request: LoginRequest): Promise<Response<AuthResponse>>;
  me(userId: string): Promise<Response<AuthUser>>;
}
