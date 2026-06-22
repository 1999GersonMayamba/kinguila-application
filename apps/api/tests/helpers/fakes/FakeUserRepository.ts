import type {
  IUserRepository,
  UserInsert,
} from '../../../src/application/interfaces/repositories/IUserRepository';
import type { User } from '../../../src/domain/entities/User';

/** Fake em memória do repositório de utilizadores para testes unitários. */
export class FakeUserRepository implements IUserRepository {
  store = new Map<string, User>();
  private seq = 0;

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.store.values()];
  }

  async create(data: UserInsert): Promise<User> {
    const now = new Date();
    const user: User = { id: `user-${++this.seq}`, createdAt: now, updatedAt: now, ...data };
    this.store.set(user.id, user);
    return user;
  }

  async update(id: string, data: Partial<UserInsert>): Promise<User | null> {
    const current = this.store.get(id);
    if (!current) return null;
    const updated: User = { ...current, ...data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.store.values()].find((u) => u.email === email) ?? null;
  }
}
