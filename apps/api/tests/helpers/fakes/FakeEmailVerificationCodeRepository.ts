import type {
  EmailVerificationCodeInsert,
  IEmailVerificationCodeRepository,
} from '../../../src/application/interfaces/repositories/IEmailVerificationCodeRepository';
import type { EmailVerificationCode } from '../../../src/domain/entities/EmailVerificationCode';

/** Fake em memória do repositório de códigos de verificação. */
export class FakeEmailVerificationCodeRepository implements IEmailVerificationCodeRepository {
  store = new Map<string, EmailVerificationCode>();
  private seq = 0;

  async findById(id: string): Promise<EmailVerificationCode | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<EmailVerificationCode[]> {
    return [...this.store.values()];
  }

  async create(data: EmailVerificationCodeInsert): Promise<EmailVerificationCode> {
    const code: EmailVerificationCode = {
      id: `code-${++this.seq}`,
      createdAt: new Date(),
      ...data,
    };
    this.store.set(code.id, code);
    return code;
  }

  async update(
    id: string,
    data: Partial<EmailVerificationCodeInsert>,
  ): Promise<EmailVerificationCode | null> {
    const current = this.store.get(id);
    if (!current) return null;
    const updated = { ...current, ...data };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findActiveByUserId(userId: string): Promise<EmailVerificationCode | null> {
    const now = Date.now();
    return (
      [...this.store.values()]
        .filter((c) => c.userId === userId && !c.consumedAt && c.expiresAt.getTime() > now)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
    );
  }

  async findLatestByUserId(userId: string): Promise<EmailVerificationCode | null> {
    return (
      [...this.store.values()]
        .filter((c) => c.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
    );
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    for (const c of this.store.values()) {
      if (c.userId === userId && !c.consumedAt) c.consumedAt = new Date();
    }
  }

  async markConsumed(id: string): Promise<void> {
    const c = this.store.get(id);
    if (c && !c.consumedAt) c.consumedAt = new Date();
  }

  async incrementAttempt(id: string): Promise<void> {
    const c = this.store.get(id);
    if (c) c.attemptCount += 1;
  }
}
