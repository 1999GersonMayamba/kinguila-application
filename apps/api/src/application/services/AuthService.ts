import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
} from '@kinguila/contracts';
import { ROLE_CLIENT } from '../../domain/entities/Role';
import type { User } from '../../domain/entities/User';
import { Response } from '../common/Response';
import type { IPasswordHasher } from '../interfaces/identity/IPasswordHasher';
import type { ITokenService } from '../interfaces/identity/ITokenService';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { IAuthService } from '../interfaces/services/IAuthService';
import type { IEmailVerificationService } from '../interfaces/services/IEmailVerificationService';

/** Regras de registo, autenticação e leitura do utilizador autenticado. */
export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
    private readonly emailVerification: IEmailVerificationService,
  ) {}

  async register(request: RegisterRequest): Promise<Response<RegisterResponse>> {
    const email = request.email.trim().toLowerCase();

    const existing = await this.users.findByEmail(email);
    if (existing) {
      return Response.fail('Já existe uma conta com este email.', [], 409);
    }

    const passwordHash = await this.hasher.hash(request.password);
    // A conta nasce por confirmar (emailConfirmedAt = null) e NÃO recebe tokens.
    const user = await this.users.create({
      name: request.name.trim(),
      email,
      passwordHash,
      roles: [ROLE_CLIENT],
      emailConfirmedAt: null,
      tokenVersion: 0,
      disabledAt: null,
    });

    // O envio do código é não-fatal: se a Resend falhar, a conta fica pendente e
    // o utilizador pode reenviar (evita conta órfã bloqueada por 409 no re-registo).
    try {
      await this.emailVerification.sendCode(user.id, email);
    } catch {
      // Falha de envio não impede o registo; o reenvio resolve.
    }

    return Response.created<RegisterResponse>(
      { email: user.email, verificationRequired: true },
      'Conta criada. Confirme o email com o código enviado.',
    );
  }

  async login(request: LoginRequest): Promise<Response<AuthResponse>> {
    const email = request.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    // Mensagem genérica: não revelar se o email existe.
    if (!user || !(await this.hasher.verify(request.password, user.passwordHash))) {
      return Response.fail('Credenciais inválidas.', [], 401);
    }

    // Conta não confirmada: 403 com código próprio para o FE distinguir do 401.
    if (!user.emailConfirmedAt) {
      return Response.fail(
        'Conta não confirmada. Verifique o seu email.',
        [],
        403,
        'ACCOUNT_NOT_CONFIRMED',
      );
    }

    // Conta desativada por um admin: 403 com código próprio.
    if (user.disabledAt) {
      return Response.fail('Conta desativada. Contacte o suporte.', [], 403, 'ACCOUNT_DISABLED');
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

  async refresh(request: RefreshTokenRequest): Promise<Response<AuthResponse>> {
    const claims = await this.tokens.verifyRefresh(request.refreshToken);
    if (!claims) {
      return Response.fail('Sessão inválida.', [], 401, 'INVALID_REFRESH_TOKEN');
    }

    // Só renova se o tokenVersion ainda for o atual (não revogado por logout).
    const user = await this.users.findById(claims.sub);
    if (!user || user.tokenVersion !== claims.tokenVersion) {
      return Response.fail('Sessão inválida.', [], 401, 'INVALID_REFRESH_TOKEN');
    }

    return Response.ok(await this.buildAuthResponse(user), 'Sessão renovada.');
  }

  async logout(userId: string): Promise<Response<null>> {
    const user = await this.users.findById(userId);
    if (user) {
      // Incrementar o tokenVersion invalida todos os tokens (access + refresh).
      await this.users.update(userId, { tokenVersion: user.tokenVersion + 1 });
    }
    return Response.ok(null, 'Sessão terminada.');
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.tokens.issue({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tokenVersion: user.tokenVersion,
    });
    return { user: this.toAuthUser(user), tokens };
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, name: user.name, email: user.email, roles: user.roles };
  }
}
