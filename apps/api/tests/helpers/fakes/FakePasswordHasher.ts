import type { IPasswordHasher } from '../../../src/application/interfaces/identity/IPasswordHasher';

/** Fake de hashing: rápido e determinístico para testes (não usar em produção). */
export class FakePasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return `hashed:${plain}` === hash;
  }
}
