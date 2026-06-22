import type {
  IPasswordResetTokenRepository,
  PasswordResetTokenInsert,
} from '../../../src/application/interfaces/repositories/IPasswordResetTokenRepository';
import type { PasswordResetToken } from '../../../src/domain/entities/PasswordResetToken';

/** Fake em memória do repositório de tokens de reset. */
export class FakePasswordResetTokenRepository implements IPasswordResetTokenRepository {
  store = new Map<string, PasswordResetToken>();
  private seq = 0;

  async findById(id: string): Promise<PasswordResetToken | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<PasswordResetToken[]> {
    return [...this.store.values()];
  }

  async create(data: PasswordResetTokenInsert): Promise<PasswordResetToken> {
    const token: PasswordResetToken = { id: `reset-${++this.seq}`, createdAt: new Date(), ...data };
    this.store.set(token.id, token);
    return token;
  }

  async update(
    id: string,
    data: Partial<PasswordResetTokenInsert>,
  ): Promise<PasswordResetToken | null> {
    const current = this.store.get(id);
    if (!current) return null;
    const updated = { ...current, ...data };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findActiveByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const now = Date.now();
    return (
      [...this.store.values()].find(
        (t) => t.tokenHash === tokenHash && !t.consumedAt && t.expiresAt.getTime() > now,
      ) ?? null
    );
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    for (const t of this.store.values()) {
      if (t.userId === userId && !t.consumedAt) t.consumedAt = new Date();
    }
  }

  async markConsumed(id: string): Promise<void> {
    const t = this.store.get(id);
    if (t && !t.consumedAt) t.consumedAt = new Date();
  }
}
