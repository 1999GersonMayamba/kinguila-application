import type { PasswordResetToken } from '../../../domain/entities/PasswordResetToken';
import type { IGenericRepository } from './IGenericRepository';

export type PasswordResetTokenInsert = Omit<PasswordResetToken, 'id' | 'createdAt'>;

export interface IPasswordResetTokenRepository
  extends IGenericRepository<PasswordResetToken, PasswordResetTokenInsert> {
  /**
   * Localiza o token ativo (não consumido e não expirado) pelo hash. É o único
   * lookup possível em `validateToken`/`reset`, que recebem só o token (sem userId).
   */
  findActiveByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  /** Marca como consumidos todos os tokens ativos do utilizador. */
  invalidateAllByUserId(userId: string): Promise<void>;
  /** Marca um token como consumido. */
  markConsumed(id: string): Promise<void>;
}
