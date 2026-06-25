import type {
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
} from '@kinguila/contracts';
import { Response } from '../common/Response';
import { buildPasswordResetEmail } from '../email/templates/authEmails';
import type { IPasswordHasher } from '../interfaces/identity/IPasswordHasher';
import type { IVerificationTokenFactory } from '../interfaces/identity/IVerificationTokenFactory';
import type { IEmailProvider } from '../interfaces/integrations/IEmailProvider';
import type { IPasswordResetTokenRepository } from '../interfaces/repositories/IPasswordResetTokenRepository';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { IPasswordResetService } from '../interfaces/services/IPasswordResetService';

export interface PasswordResetConfig {
  /** Validade do token de reset, em segundos. */
  tokenTtlSeconds: number;
  /** URL base do front-end, usada para montar o link do email. */
  webAppUrl: string;
}

/** Pedido, validação e conclusão do reset de senha por token. */
export class PasswordResetService implements IPasswordResetService {
  constructor(
    private readonly users: IUserRepository,
    private readonly resetTokens: IPasswordResetTokenRepository,
    private readonly factory: IVerificationTokenFactory,
    private readonly email: IEmailProvider,
    private readonly hasher: IPasswordHasher,
    private readonly config: PasswordResetConfig,
  ) {}

  async request(request: RequestPasswordResetRequest): Promise<Response<null>> {
    const email = request.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    // Anti-enumeração: só geramos token e enviamos se a conta existir; a resposta
    // é sempre genérica.
    if (user) {
      await this.sendResetEmail(user.id, email);
    }

    return Response.ok(null, 'Se a conta existir, enviámos um link de redefinição.');
  }

  async validateToken(request: ValidateResetTokenRequest): Promise<Response<null>> {
    const record = await this.resetTokens.findActiveByTokenHash(this.factory.hash(request.token));
    if (!record) {
      return Response.fail('Link inválido ou expirado.', [], 403, 'INVALID_OR_EXPIRED_TOKEN');
    }
    return Response.ok(null, 'Link válido.');
  }

  async reset(request: ResetPasswordRequest): Promise<Response<null>> {
    const record = await this.resetTokens.findActiveByTokenHash(this.factory.hash(request.token));
    if (!record) {
      return Response.fail('Link inválido ou expirado.', [], 403, 'INVALID_OR_EXPIRED_TOKEN');
    }

    const passwordHash = await this.hasher.hash(request.password);
    await this.users.update(record.userId, { passwordHash });
    await this.resetTokens.markConsumed(record.id);
    // Invalida quaisquer outros tokens de reset do utilizador.
    await this.resetTokens.invalidateAllByUserId(record.userId);

    return Response.ok(null, 'Senha redefinida com sucesso.');
  }

  async requestForUser(userId: string): Promise<Response<null>> {
    const user = await this.users.findById(userId);
    if (!user) {
      return Response.notFound('Utilizador não encontrado.');
    }
    await this.sendResetEmail(user.id, user.email);
    return Response.ok(null, 'Email de redefinição enviado.');
  }

  /** Gera token, persiste o hash e envia o email de reset para o utilizador. */
  private async sendResetEmail(userId: string, email: string): Promise<void> {
    await this.resetTokens.invalidateAllByUserId(userId);
    const token = this.factory.generateToken();
    await this.resetTokens.create({
      userId,
      tokenHash: this.factory.hash(token),
      expiresAt: new Date(Date.now() + this.config.tokenTtlSeconds * 1000),
      consumedAt: null,
    });
    const link = `${this.normalizedBaseUrl()}/reset-password#token=${token}`;
    await this.email.send({ to: email, ...buildPasswordResetEmail(link) });
  }

  /** Remove uma eventual barra final para evitar `//reset-password`. */
  private normalizedBaseUrl(): string {
    return this.config.webAppUrl.replace(/\/+$/, '');
  }
}
