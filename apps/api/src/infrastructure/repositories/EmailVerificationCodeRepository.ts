import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import type {
  EmailVerificationCodeInsert,
  IEmailVerificationCodeRepository,
} from '../../application/interfaces/repositories/IEmailVerificationCodeRepository';
import type { EmailVerificationCode } from '../../domain/entities/EmailVerificationCode';
import type { Database } from '../database/client';
import {
  type EmailVerificationCodeRow,
  emailVerificationCodes,
} from '../database/schema/emailVerificationCodes';
import { DrizzleGenericRepository } from './DrizzleGenericRepository';

function mapRow(row: EmailVerificationCodeRow): EmailVerificationCode {
  return {
    id: row.id,
    userId: row.userId,
    codeHash: row.codeHash,
    attemptCount: row.attemptCount,
    expiresAt: row.expiresAt,
    consumedAt: row.consumedAt,
    createdAt: row.createdAt,
  };
}

export class EmailVerificationCodeRepository
  extends DrizzleGenericRepository<
    EmailVerificationCode,
    EmailVerificationCodeInsert,
    typeof emailVerificationCodes
  >
  implements IEmailVerificationCodeRepository
{
  constructor(db: Database) {
    super(db, emailVerificationCodes, mapRow, (data) => ({
      userId: data.userId,
      codeHash: data.codeHash,
      attemptCount: data.attemptCount,
      expiresAt: data.expiresAt,
      consumedAt: data.consumedAt,
    }));
  }

  async findActiveByUserId(userId: string): Promise<EmailVerificationCode | null> {
    const rows = await this.db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.userId, userId),
          isNull(emailVerificationCodes.consumedAt),
          gt(emailVerificationCodes.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(emailVerificationCodes.createdAt))
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async findLatestByUserId(userId: string): Promise<EmailVerificationCode | null> {
    const rows = await this.db
      .select()
      .from(emailVerificationCodes)
      .where(eq(emailVerificationCodes.userId, userId))
      .orderBy(desc(emailVerificationCodes.createdAt))
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    // Update custom (sem updatedAt — a tabela não tem essa coluna).
    await this.db
      .update(emailVerificationCodes)
      .set({ consumedAt: new Date() })
      .where(
        and(eq(emailVerificationCodes.userId, userId), isNull(emailVerificationCodes.consumedAt)),
      );
  }

  async markConsumed(id: string): Promise<void> {
    await this.db
      .update(emailVerificationCodes)
      .set({ consumedAt: new Date() })
      .where(and(eq(emailVerificationCodes.id, id), isNull(emailVerificationCodes.consumedAt)));
  }

  async incrementAttempt(id: string): Promise<void> {
    await this.db
      .update(emailVerificationCodes)
      .set({ attemptCount: sql`${emailVerificationCodes.attemptCount} + 1` })
      .where(eq(emailVerificationCodes.id, id));
  }
}
