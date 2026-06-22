import { and, eq, gt, isNull } from 'drizzle-orm';
import type {
  IPasswordResetTokenRepository,
  PasswordResetTokenInsert,
} from '../../application/interfaces/repositories/IPasswordResetTokenRepository';
import type { PasswordResetToken } from '../../domain/entities/PasswordResetToken';
import type { Database } from '../database/client';
import {
  type PasswordResetTokenRow,
  passwordResetTokens,
} from '../database/schema/passwordResetTokens';
import { DrizzleGenericRepository } from './DrizzleGenericRepository';

function mapRow(row: PasswordResetTokenRow): PasswordResetToken {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    consumedAt: row.consumedAt,
    createdAt: row.createdAt,
  };
}

export class PasswordResetTokenRepository
  extends DrizzleGenericRepository<
    PasswordResetToken,
    PasswordResetTokenInsert,
    typeof passwordResetTokens
  >
  implements IPasswordResetTokenRepository
{
  constructor(db: Database) {
    super(db, passwordResetTokens, mapRow, (data) => ({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      consumedAt: data.consumedAt,
    }));
  }

  async findActiveByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const rows = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.consumedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    await this.db
      .update(passwordResetTokens)
      .set({ consumedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.consumedAt)));
  }

  async markConsumed(id: string): Promise<void> {
    await this.db
      .update(passwordResetTokens)
      .set({ consumedAt: new Date() })
      .where(and(eq(passwordResetTokens.id, id), isNull(passwordResetTokens.consumedAt)));
  }
}
