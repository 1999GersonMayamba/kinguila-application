import { index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const offers = pgTable(
  'offers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    // Códigos de moeda e estado persistem como texto.
    sellCurrency: text('sell_currency').notNull(),
    buyCurrency: text('buy_currency').notNull(),
    // Montantes monetários em numeric (precisão), nunca float.
    exchangeRate: numeric('exchange_rate', { precision: 18, scale: 6 }).notNull(),
    availableAmount: numeric('available_amount', { precision: 18, scale: 2 }).notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusPairIdx: index('offers_status_pair_idx').on(
      table.status,
      table.sellCurrency,
      table.buyCurrency,
    ),
    sellerIdx: index('offers_seller_idx').on(table.sellerId),
  }),
);

export type OfferRow = typeof offers.$inferSelect;
export type OfferInsertRow = typeof offers.$inferInsert;
