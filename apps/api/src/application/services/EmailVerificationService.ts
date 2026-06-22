import type {
  AuthResponse,
  AuthUser,
  ConfirmEmailRequest,
  ResendCodeRequest,
} from '@kinguila/contracts';
import type { User } from '../../domain/entities/User';
import { Response } from '../common/Response';
import { buildVerificationCodeEmail } from '../email/templates/authEmails';
import type { ITokenService } from '../interfaces/identity/ITokenService';
import type { IVerificationTokenFactory } from '../interfaces/identity/IVerificationTokenFactory';
import type { IEmailProvider } from '../interfaces/integrations/IEmailProvider';
import type { IEmailVerificationCodeRepository } from '../interfaces/repositories/IEmailVerificationCodeRepository';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { IEmailVerificationService } from '../interfaces/services/IEmailVerificationService';

export interface EmailVerificationConfig {
  /** Validade do código, em segundos. */
  codeTtlSeconds: number;
  /** Janela mínima entre reenvios, em segundos. */
  resendRateLimitSeconds: number;
  /** Tentativas falhadas antes do lockout. */
  maxAttempts: number;
}

/** Confirmação de conta por código de email e reenvio. */
export class EmailVerificationService implements IEmailVerificationService {
  constructor(
    private readonly users: IUserRepository,
    private readonly codes: IEmailVerificationCodeRepository,
    private readonly factory: IVerificationTokenFactory,
    private readonly email: IEmailProvider,
    private readonly tokens: ITokenService,
    private readonly config: EmailVerificationConfig,
  ) {}

  async sendCode(userId: string, email: string): Promise<void> {
    await this.codes.invalidateAllByUserId(userId);

    const code = this.factory.generateCode();
    await this.codes.create({
      userId,
      codeHash: this.factory.hash(code),
      attemptCount: 0,
      expiresAt: new Date(Date.now() + this.config.codeTtlSeconds * 1000),
      consumedAt: null,
    });

    await this.email.send({ to: email, ...buildVerificationCodeEmail(code) });
  }

  async confirm(request: ConfirmEmailRequest): Promise<Response<AuthResponse>> {
    const email = request.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    // Resposta genérica: não revelar se o email existe.
    if (!user) {
      return Response.fail('Código inválido ou expirado.', [], 403, 'INVALID_OR_EXPIRED_CODE');
    }

    const code = await this.codes.findActiveByUserId(user.id);
    if (!code) {
      return Response.fail('Código inválido ou expirado.', [], 403, 'INVALID_OR_EXPIRED_CODE');
    }

    if (code.attemptCount >= this.config.maxAttempts) {
      return Response.fail(
        'Demasiadas tentativas. Peça um novo código.',
        [],
        403,
        'CODE_LOCKED_OUT',
      );
    }

    if (!this.factory.verify(request.code, code.codeHash)) {
      await this.codes.incrementAttempt(code.id);
      return Response.fail('Código inválido ou expirado.', [], 403, 'INVALID_OR_EXPIRED_CODE');
    }

    await this.codes.markConsumed(code.id);
    const confirmed = (await this.users.update(user.id, { emailConfirmedAt: new Date() })) ?? user;

    return Response.ok(await this.buildAuthResponse(confirmed), 'Conta confirmada com sucesso.');
  }

  async resend(request: ResendCodeRequest): Promise<Response<null>> {
    const email = request.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    // Anti-enumeração: resposta uniforme exista ou não a conta. Só enviamos
    // quando a conta existe e está fora da janela de rate-limit.
    if (user) {
      const latest = await this.codes.findLatestByUserId(user.id);
      const withinWindow =
        latest !== null &&
        Date.now() - latest.createdAt.getTime() < this.config.resendRateLimitSeconds * 1000;
      if (!withinWindow) {
        await this.sendCode(user.id, email);
      }
    }

    return Response.ok(null, 'Se a conta existir, enviámos um novo código.');
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
