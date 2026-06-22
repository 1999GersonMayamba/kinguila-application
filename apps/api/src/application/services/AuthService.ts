import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@kinguila/contracts';
import { ROLE_USER } from '../../domain/entities/Role';
import type { User } from '../../domain/entities/User';
import { Response } from '../common/Response';
import type { IPasswordHasher } from '../interfaces/identity/IPasswordHasher';
import type { ITokenService } from '../interfaces/identity/ITokenService';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { IAuthService } from '../interfaces/services/IAuthService';

/** Regras de registo, autenticação e leitura do utilizador autenticado. */
export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async register(request: RegisterRequest): Promise<Response<AuthResponse>> {
    const email = request.email.trim().toLowerCase();

    const existing = await this.users.findByEmail(email);
    if (existing) {
      return Response.fail('Já existe uma conta com este email.', [], 409);
    }

    const passwordHash = await this.hasher.hash(request.password);
    const user = await this.users.create({
      name: request.name.trim(),
      email,
      passwordHash,
      roles: [ROLE_USER],
    });

    return Response.created(await this.buildAuthResponse(user));
  }

  async login(request: LoginRequest): Promise<Response<AuthResponse>> {
    const email = request.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    // Mensagem genérica: não revelar se o email existe.
    if (!user || !(await this.hasher.verify(request.password, user.passwordHash))) {
      return Response.fail('Credenciais inválidas.', [], 401);
    }

    return Response.ok(await this.buildAuthResponse(user), 'Autenticado com sucesso.');
  }

  async me(userId: string): Promise<Response<AuthUser>> {
    const user = await this.users.findById(userId);
    if (!user) {
      return Response.notFound('Utilizador não encontrado.');
    }
    return Response.ok(this.toAuthUser(user));
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.tokens.issue({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    return { user: this.toAuthUser(user), tokens };
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, name: user.name, email: user.email, roles: user.roles };
  }
}
