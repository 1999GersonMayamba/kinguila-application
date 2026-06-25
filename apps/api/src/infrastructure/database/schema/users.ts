import { sql } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // Papéis como array de texto (enums persistidos como texto).
  roles: jsonb('roles').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  // Null = conta por confirmar. Preenchido ao validar o código de email.
  emailConfirmedAt: timestamp('email_confirmed_at', { withTimezone: true }),
  // Incrementado no logout para invalidar tokens (access + refresh) já emitidos.
  tokenVersion: integer('token_version').notNull().default(0),
  // Null = conta ativa. Preenchido quando um admin desativa a conta.
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type UserInsertRow = typeof users.$inferInsert;
