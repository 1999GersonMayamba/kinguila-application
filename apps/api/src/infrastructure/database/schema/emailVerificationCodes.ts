import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const emailVerificationCodes = pgTable(
  'email_verification_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Apenas o hash do código é persistido (nunca o valor cru).
    codeHash: text('code_hash').notNull(),
    attemptCount: integer('attempt_count').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('email_verification_codes_user_idx').on(table.userId),
  }),
);

export type EmailVerificationCodeRow = typeof emailVerificationCodes.$inferSelect;
export type EmailVerificationCodeInsertRow = typeof emailVerificationCodes.$inferInsert;
