import { and, count, desc, eq, ilike, sql } from 'drizzle-orm';
import type {
  IUserRepository,
  ListUsersFilters,
  UserInsert,
} from '../../application/interfaces/repositories/IUserRepository';
import type { User } from '../../domain/entities/User';
import type { Database } from '../database/client';
import { type UserRow, users } from '../database/schema/users';
import { DrizzleGenericRepository } from './DrizzleGenericRepository';

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    roles: row.roles,
    emailConfirmedAt: row.emailConfirmedAt,
    tokenVersion: row.tokenVersion,
    disabledAt: row.disabledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository
  extends DrizzleGenericRepository<User, UserInsert, typeof users>
  implements IUserRepository
{
  constructor(db: Database) {
    super(db, users, mapRow, (data) => ({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      roles: data.roles,
      emailConfirmedAt: data.emailConfirmedAt,
      tokenVersion: data.tokenVersion,
      disabledAt: data.disabledAt,
    }));
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async listPaged(filters: ListUsersFilters): Promise<{ items: User[]; total: number }> {
    const conditions = [];
    if (filters.name) {
      conditions.push(ilike(users.name, `%${filters.name}%`));
    }
    if (filters.email) {
      conditions.push(ilike(users.email, `%${filters.email}%`));
    }
    if (filters.role) {
      // roles é jsonb (string[]); containment `@>` testa se a role está presente.
      conditions.push(sql`${users.roles} @> ${JSON.stringify([filters.role])}::jsonb`);
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, totalRows] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db.select({ value: count() }).from(users).where(where),
    ]);

    return { items: rows.map(mapRow), total: totalRows[0]?.value ?? 0 };
  }
}
