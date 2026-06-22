import { eq } from 'drizzle-orm';
import type {
  IUserRepository,
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
    }));
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }
}
