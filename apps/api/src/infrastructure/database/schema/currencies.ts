import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

export const currencies = pgTable('currencies', {
  // Código ISO-4217 é a própria chave primária (texto).
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  // Chave de ícone ou URL (string curta); nunca markup. Opcional.
  icon: text('icon'),
  enabled: boolean('enabled').notNull().default(true),
});

export type CurrencyRow = typeof currencies.$inferSelect;
export type CurrencyInsertRow = typeof currencies.$inferInsert;
