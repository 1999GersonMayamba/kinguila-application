import type { EmailVerificationCode } from '../../../domain/entities/EmailVerificationCode';
import type { IGenericRepository } from './IGenericRepository';

export type EmailVerificationCodeInsert = Omit<EmailVerificationCode, 'id' | 'createdAt'>;

export interface IEmailVerificationCodeRepository
  extends IGenericRepository<EmailVerificationCode, EmailVerificationCodeInsert> {
  /** Código ativo (não consumido e não expirado) mais recente do utilizador. */
  findActiveByUserId(userId: string): Promise<EmailVerificationCode | null>;
  /** Código mais recente (independente do estado), para o rate-limit de reenvio. */
  findLatestByUserId(userId: string): Promise<EmailVerificationCode | null>;
  /** Marca como consumidos todos os códigos ativos do utilizador. */
  invalidateAllByUserId(userId: string): Promise<void>;
  /** Marca um código como consumido. */
  markConsumed(id: string): Promise<void>;
  /** Incrementa o contador de tentativas falhadas (lockout). */
  incrementAttempt(id: string): Promise<void>;
}
