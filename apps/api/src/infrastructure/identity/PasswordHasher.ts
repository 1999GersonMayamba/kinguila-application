import type { IPasswordHasher } from '../../application/interfaces/identity/IPasswordHasher';

/**
 * Hashing de passwords com argon2id, usando a API nativa do Bun (sem dependências).
 */
export class PasswordHasher implements IPasswordHasher {
  hash(plain: string): Promise<string> {
    return Bun.password.hash(plain, { algorithm: 'argon2id' });
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return Bun.password.verify(plain, hash);
  }
}
