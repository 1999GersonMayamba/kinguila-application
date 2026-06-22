import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
} from '@kinguila/contracts';
import type { Response } from '../../common/Response';

export interface IAuthService {
  register(request: RegisterRequest): Promise<Response<RegisterResponse>>;
  login(request: LoginRequest): Promise<Response<AuthResponse>>;
  me(userId: string): Promise<Response<AuthUser>>;
  /** Renova a sessão a partir de um refresh token válido. */
  refresh(request: RefreshTokenRequest): Promise<Response<AuthResponse>>;
  /** Termina a sessão: incrementa o tokenVersion, invalidando todos os tokens. */
  logout(userId: string): Promise<Response<null>>;
}
