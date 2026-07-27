import { numeric, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const walletBalances = pgTable(
  'wallet_balances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Código de moeda persiste como texto.
    currency: text('currency').notNull(),
    // Montantes monetários em numeric (precisão), nunca float.
    balance: numeric('balance', { precision: 18, scale: 2 }).notNull().default('0'),
    listedAmount: numeric('listed_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Um único saldo por utilizador e moeda.
    userCurrencyIdx: uniqueIndex('wallet_balances_user_currency_idx').on(
      table.userId,
      table.currency,
    ),
  }),
);

export type WalletBalanceRow = typeof walletBalances.$inferSelect;
export type WalletBalanceInsertRow = typeof walletBalances.$inferInsert;
